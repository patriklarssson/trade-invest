'use strict';

import { EventEmitter } from 'events';
import * as https from 'https';
import * as querystring from 'querystring';
import { WebSocket } from 'ws';
import { constants } from './constants';
import { totp } from './totp';
// @ts-ignore
import { version } from '../../package.json';

interface Totp {
  username: string;
  password: string;
  totp: string;
  totpSecret: string;
}

interface TransactionOptions {
  from: string;
  to: string;
  maxAmount: number;
  minAmount: number;
  orderbookId: string | string[];
}

interface PlaceOrderOptions {
  options: {
    accountId: string;
    orderbookId: string;
    orderType: string;
    price: number;
    validUntil: string;
    volume: number;
  };
}

const BASE_URL = 'www.avanza.se';
const USER_AGENT =
  process.env['AVANZA_USER_AGENT'] || `Avanza API client/${version ?? '0.0.1'}`;
const MIN_INACTIVE_MINUTES = 30;
const MAX_INACTIVE_MINUTES = 60 * 24;
const SOCKET_URL = 'wss://www.avanza.se/_push/cometd';
const MAX_BACKOFF_MS = 2 * 60 * 1000;

function debug(...message: any[]) {
  if (process.env['NODE_ENV'] === 'development') {
    // eslint-disable-next-line no-console
    console.error(...message);
  }
}

function request(options: https.RequestOptions & { data: string | object }) {
  if (!options) {
    return Promise.reject(new Error('Missing options.'));
  }

  const data = JSON.stringify(options.data);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        host: BASE_URL,
        port: 443,
        method: options.method,
        path: options.path,
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
          'User-Agent': USER_AGENT,
          'Content-Length': Buffer.byteLength(data),
          ...options.headers,
        },
      },
      (response) => {
        const body: any[] = [];
        response.on('data', (chunk) => body.push(chunk));
        response.on('end', () => {
          let parsedBody = body.join('');

          try {
            parsedBody = JSON.parse(parsedBody);
          } catch (e) {
            debug('Received non-JSON data from API.', body);
          }

          const res = {
            statusCode: response.statusCode,
            statusMessage: response.statusMessage,
            headers: response.headers,
            body: parsedBody,
          };

          if (
            response.statusCode === undefined ||
            response.statusCode < 200 ||
            response.statusCode > 299
          ) {
            reject(res);
          } else {
            resolve(res);
          }
        });
      }
    );

    if (data) {
      req.write(data);
    }

    req.on('error', (e) => reject(e));
    req.end();
  });
}

class Avanza extends EventEmitter {
  private _credentials: Totp | null;
  private _socket: WebSocket | null;
  private _authenticated: boolean;
  private _authenticationSession: number | null;
  private _authenticationTimeout: number;
  private _pushSubscriptionId: number | null | undefined;
  private _reauthentication: NodeJS.Timer | null;
  private _customerId: number | null;
  private _securityToken: string | string[] | null | undefined;
  private _backOffTimestamps: {
    [key: string]: any;
  };
  private _socketHandshakeTimer: NodeJS.Timer | null;
  private _socketSubscriptions: {
    [key: string]: any;
  };
  private _socketMonitor: NodeJS.Timer | null;
  private _socketLastMetaConnect: number;
  private _adviceTimeout: number;
  private _socketConnected: boolean;
  private _socketMessageCount: number;
  private _socketClientId: string | null;
  constructor() {
    super();
    this._credentials = null;
    this._socket = null;
    this._authenticated = false;
    this._authenticationSession = null;
    this._authenticationTimeout = MAX_INACTIVE_MINUTES;
    this._pushSubscriptionId = null;
    this._reauthentication = null;
    this._customerId = null;
    this._securityToken = null;
    this._backOffTimestamps = {};
    this._socketHandshakeTimer = null;
    this._socketSubscriptions = {};
    this._socketMonitor = null;
    this._socketLastMetaConnect = 0;
    this._adviceTimeout = 30000;
    this._socketConnected = false;
    this._socketMessageCount = 1;
    this._socketClientId = null;
  }
  /* Back off algoritm helper. Avoid accidental hammering when responding
   * to asynchronous events by scheduling the response using setTimeout()
   * with this function as the timeout input. Example:
   *   setTimeout(() => { ... }, _backoffCalc('relogin')) */

  private _backoffCalc(actionName: string) {
    const now = Date.now();
    let schedDelay = 0;

    if (now - this._backOffTimestamps[actionName] < MAX_BACKOFF_MS * 5) {
      schedDelay = (now - this._backOffTimestamps[actionName]) * 2 + 500;

      if (schedDelay > MAX_BACKOFF_MS) {
        schedDelay = MAX_BACKOFF_MS;
        this._backOffTimestamps[actionName] = now;
      }
    } else {
      this._backOffTimestamps[actionName] = now;
    }

    return schedDelay;
  }

  private _socketRestart() {
    if (this._socket) {
      this._socket.removeAllListeners();

      this._socket.on('error', (err) => {
        debug('Received websocket error:', err);
      });

      this._socket.terminate();

      this._socketConnected = false;
      delete this._backOffTimestamps['handshake'];
      if (this._socketMonitor) clearInterval(this._socketMonitor);
      if (this._socketHandshakeTimer) clearTimeout(this._socketHandshakeTimer);
      setTimeout(() => {
        this._socketInit(true);
      }, this._backoffCalc('websocket'));
    }
  }

  private _socketInit(restart?: boolean) {
    if (this._socket && !restart) {
      return;
    }

    this._socket = new WebSocket(SOCKET_URL);

    this._socket.on('open', () => {
      this._authenticateSocket();
    });

    this._socket.on('message', (data) => {
      this._socketHandleMessage(data);
    });

    this._socket.on('close', () => {
      this._socketRestart();
    });

    this._socket.on('error', (err) => {
      debug('Received websocket error', err);

      this._socketRestart();
    });

    this._socketMonitor = setInterval(() => {
      if (!this._pushSubscriptionId) {
        // Don't maintain socket status unless we're authenticated
        return;
      }

      if (this._socket && this._socket.readyState !== this._socket.OPEN) {
        // Don't make the assumption we will reach the open state
        // and hence don't assume there will ever be a close emitted.
        this._socketRestart();
      } else if (
        this._socketConnected &&
        this._socketLastMetaConnect + this._adviceTimeout + 5000 < Date.now()
      ) {
        this._socketRestart();
      }
    }, 5000);
  }

  private _socketSend(data: any) {
    if (this._socket && this._socket.readyState === this._socket.OPEN) {
      this._socket.send(JSON.stringify([data]));

      this._socketMessageCount += 1;
    }
  }

  private _socketHandleMessage(data: any) {
    const response = JSON.parse(data);

    for (let i = 0; i < response.length; i++) {
      if (!response[i]) {
        continue;
      }

      const message = response[i];

      if (message.error) {
        debug(message.error);
      }

      switch (message.channel) {
        case '/meta/disconnect':
          if (this._socketClientId) {
            this._authenticateSocket(true);
          }

          break;

        case '/meta/handshake':
          if (message.successful) {
            this._socketClientId = message.clientId;

            this._socketSend({
              advice: {
                timeout: 0,
              },
              channel: '/meta/connect',
              clientId: this._socketClientId,
              connectionType: 'websocket',
              id: this._socketMessageCount,
            });
          } else if (
            message.advice &&
            message.advice.reconnect === 'handshake'
          ) {
            this._authenticateSocket(true);
          } else {
            this._socketClientId = null;
            this._socketConnected = false;
            this._pushSubscriptionId = undefined;

            this._scheduleReauth();
          }

          break;

        case '/meta/connect':
          if (
            message.successful &&
            (!message.advice ||
              (message.advice.reconnect !== 'none' &&
                !(message.advice.interval < 0)))
          ) {
            this._socketLastMetaConnect = Date.now();

            this._socketSend({
              channel: '/meta/connect',
              clientId: this._socketClientId,
              connectionType: 'websocket',
              id: this._socketMessageCount,
            });

            if (!this._socketConnected) {
              this._socketConnected = true;
              Object.keys(this._socketSubscriptions).forEach((substr) => {
                if (
                  this._socketSubscriptions[substr] !== this._socketClientId
                ) {
                  this._socketSubscribe(substr);
                }
              });
            }
          } else if (this._socketClientId) {
            this._authenticateSocket(true);
          }

          break;

        case '/meta/subscribe':
          if (message.successful) {
            this._socketSubscriptions[message.subscription] =
              this._socketClientId;
          } else {
            debug('Could not subscribe:', message);
          }

          break;

        case '/meta/unsubscribe':
          if (message.successful) {
            delete this._socketSubscriptions[message.subscription];
          } else {
            debug('Could not unsubscribe:', message);
          }

          break;

        default:
          this.emit(message.channel, message.data);
      }
    }
  }

  private _authenticateSocket(forceHandshake?: any) {
    if (!this._socketClientId || forceHandshake) {
      this._socketClientId = null;
      this._socketConnected = false;

      if (this._pushSubscriptionId) {
        if (this._socketHandshakeTimer)
          clearTimeout(this._socketHandshakeTimer);
        this._socketHandshakeTimer = setTimeout(() => {
          this._socketSend({
            advice: {
              timeout: 60000,
              interval: 0,
            },
            channel: '/meta/handshake',
            ext: {
              subscriptionId: this._pushSubscriptionId,
            },
            // id: this._socketMessageCounter,
            id: this._socketMessageCount,
            minimumVersion: '1.0',
            supportedConnectionTypes: [
              'websocket',
              'long-polling',
              'callback-polling',
            ],
            version: '1.0',
          });
        }, this._backoffCalc('handshake'));
      }
    } else if (this._socketClientId) {
      this._socketSend({
        channel: '/meta/connect',
        clientId: this._socketClientId,
        connectionType: 'websocket',
        id: this._socketMessageCount,
      });
    }
  }

  private _socketSubscribe(subscriptionString: string) {
    this._socketSubscriptions[subscriptionString] = null;

    if (this._socketConnected) {
      this._socketSend({
        channel: '/meta/subscribe',
        clientId: this._socketClientId,
        id: this._socketMessageCount,
        subscription: subscriptionString,
      });
    }
  }

  private _socketUnsubscribe(subscriptionString: string) {
    if (this._socketConnected) {
      this._socketSend({
        channel: '/meta/unsubscribe',
        clientId: this._socketClientId,
        id: this._socketMessageCount,
        subscription: subscriptionString,
      });
    }
  }

  /**
   * Authenticate the client.
   */
  authenticate(credentials: Totp) {
    if (!credentials) {
      return Promise.reject(new Error('Missing credentials.'));
    }

    if (!credentials.username) {
      return Promise.reject(new Error('Missing credentials.username.'));
    }

    if (!credentials.password) {
      return Promise.reject(new Error('Missing credentials.password.'));
    }

    if (
      !(
        this._authenticationTimeout >= MIN_INACTIVE_MINUTES &&
        this._authenticationTimeout <= MAX_INACTIVE_MINUTES
      )
    ) {
      return Promise.reject(
        new Error(
          `Session timeout not in range ${MIN_INACTIVE_MINUTES} - ${MAX_INACTIVE_MINUTES} minutes.`
        )
      );
    }

    return new Promise((resolve, reject) => {
      const data = {
        maxInactiveMinutes: this._authenticationTimeout,
        password: credentials.password,
        username: credentials.username,
      };
      request({
        method: 'POST',
        path: constants.paths.AUTHENTICATION_PATH,
        data,
      })
        .then((response: any) => {
          // No second factor requested, continue with normal login
          if (typeof response.body.twoFactorLogin === 'undefined') {
            return Promise.resolve(response);
          }

          const tfaOpts = response.body.twoFactorLogin;

          if (tfaOpts.method !== 'TOTP') {
            return Promise.reject(
              new Error(`Unsupported second factor method ${tfaOpts.method}`)
            );
          }

          const totpCode = credentials.totpSecret
            ? totp(credentials.totpSecret)
            : credentials.totp;

          if (!totpCode) {
            return Promise.reject(
              new Error('Missing credentials.totp or credentials.totpSecret')
            );
          }

          return request({
            method: 'POST',
            path: constants.paths.TOTP_PATH,
            data: {
              method: 'TOTP',
              totpCode,
            },
            headers: {
              Cookie: `AZAMFATRANSACTION=${tfaOpts.transactionId}`,
            },
          });
        })
        .then((response: any) => {
          this._authenticated = true;
          this._credentials = credentials;
          this._securityToken = response.headers['x-securitytoken'];
          this._authenticationSession = response.body.authenticationSession;
          this._pushSubscriptionId = response.body.pushSubscriptionId;
          this._customerId = response.body.customerId; // Re-authenticate after timeout minus one minute

          this._scheduleReauth((this._authenticationTimeout - 1) * 60 * 1000);

          if (this._socket) {
            this._socketRestart();
          }

          resolve({
            securityToken: this._securityToken,
            authenticationSession: this._authenticationSession,
            pushSubscriptionId: this._pushSubscriptionId,
            customerId: this._customerId,
          });
        })
        .catch((e) => {
          this._pushSubscriptionId = undefined;
          reject(e);
        });
    });
  }

  bankId() {
    return new Promise((resolve, reject) => {
      request({
        method: 'POST',
        path: constants.paths.AUTHENTICATION_BANKID_PATH,
        data: {},
      })
        .then((response) => {
          resolve(response);
        })
        .catch((e) => {
          this._pushSubscriptionId = undefined;
          reject(e);
        });
    });
  }
  bankIdCollect(transactionId: string) {
    return new Promise((resolve, reject) => {
      request({
        method: 'GET',
        path: constants.paths.AUTHENTICATION_BANKID_COLLECT_PATH,
        data: {},
        headers: {
          Cookie: `${constants.cookies.AUTHENTICATION_AZABANKIDTRANSID_COOKIE}=${transactionId}`,
        },
      })
        .then((response) => {
          resolve(response);
        })
        .catch((e) => {
          this._pushSubscriptionId = undefined;
          reject(e);
        });
    });
  }
  bankIdCollectCustomerId(transactionId: string, customerId: number) {
    return new Promise((resolve, reject) => {
      request({
        method: 'GET',
        path: `${constants.paths.AUTHENTICATION_BANKID_COLLECT_PATH}/${customerId}`,
        data: {},
        headers: {
          Cookie: `${constants.cookies.AUTHENTICATION_AZABANKIDTRANSID_COOKIE}=${transactionId}`,
        },
      })
        .then((response: any) => {
          this._authenticated = true;
          this._securityToken = response.headers['x-securitytoken'];
          this._authenticationSession = response.body.authenticationSession;
          this._pushSubscriptionId = response.body.pushSubscriptionId;
          this._customerId = response.body.customerId;
          resolve(response);
        })
        .catch((e) => {
          this._pushSubscriptionId = undefined;
          reject(e);
        });
    });
  }

  /* Re-authenticate after specified timeout.
   * In the event of failure retry with backoff until we succeed.
   */

  private _scheduleReauth(delay?: number) {
    if (this._reauthentication) clearTimeout(this._reauthentication);
    this._reauthentication = setTimeout(() => {
      if (this._credentials)
        this.authenticate(this._credentials).catch((error) => {
          debug('Could not authenticate:', error);

          this._scheduleReauth(this._backoffCalc('authenticate'));
        });
    }, delay || this._backoffCalc('authenticate'));
  }
  /**
   * Disconnects by simulating a client that just goes away.
   */

  disconnect() {
    if (this._reauthentication) clearTimeout(this._reauthentication);
    this._authenticated = false; // Make sure all calls to main site will fail after this point

    this.removeAllListeners(); // Remove all subscription callbacks
    if (this._socketMonitor) clearInterval(this._socketMonitor);

    if (this._socket) {
      this._socket.removeAllListeners();

      this._socket.on('error', (err) => {
        debug('Received websocket error:', err);
      });

      this._socket.terminate();

      this._socket = null;
    }

    this._socketClientId = null;
    this._socketConnected = false;
    this._pushSubscriptionId = undefined;
    this._socketSubscriptions = {}; // Next startup of websocket should start without subscriptions
  }

  // Actions
  getPositions() {
    return this.call('GET', constants.paths.POSITIONS_PATH);
  }

  getOverview() {
    return this.call('GET', constants.paths.OVERVIEW_PATH);
  }

  getAccountOverview(accountId: string) {
    const path = constants.paths.ACCOUNT_OVERVIEW_PATH.replace(
      '{0}',
      accountId
    );
    return this.call('GET', path);
  }

  getDealsAndOrders() {
    return this.call('GET', constants.paths.DEALS_AND_ORDERS_PATH);
  }

  getTransactions(
    accountOrTransactionType: string,
    options: TransactionOptions
  ) {
    const path = constants.paths.TRANSACTIONS_PATH.replace(
      '{0}',
      accountOrTransactionType
    );

    if (options && Array.isArray(options.orderbookId)) {
      options.orderbookId = options.orderbookId.join(',');
    }

    const query = querystring.stringify(options as any);
    return this.call('GET', query ? `${path}?${query}` : path);
  }

  getWatchlists() {
    return this.call('GET', constants.paths.WATCHLISTS_PATH);
  }

  addToWatchlist(instrumentId: string, watchlistId: string) {
    const path = constants.paths.WATCHLISTS_ADD_DELETE_PATH.replace(
      '{0}',
      watchlistId
    ).replace('{1}', instrumentId);
    return this.call('PUT', path);
  }

  removeFromWatchlist(instrumentId: string, watchlistId: string) {
    const path = constants.paths.WATCHLISTS_ADD_DELETE_PATH.replace(
      '{0}',
      watchlistId
    ).replace('{1}', instrumentId);
    return this.call('DELETE', path);
  }

  getInstrument(instrumentType: string, instrumentId: string) {
    const path = constants.paths.INSTRUMENT_PATH.replace(
      '{0}',
      instrumentType.toLowerCase()
    ).replace('{1}', instrumentId);
    return this.call('GET', path);
  }

  getOrderbook(instrumentType: string, orderbookId: string) {
    const path = constants.paths.ORDERBOOK_PATH.replace(
      '{0}',
      instrumentType.toLowerCase()
    );
    const query = querystring.stringify({
      orderbookId,
    });
    return this.call('GET', `${path}?${query}`);
  }

  getOrderbooks(orderbookIds: string[]) {
    const ids = orderbookIds.join(',');
    const path = constants.paths.ORDERBOOK_LIST_PATH.replace('{0}', ids);
    const query = querystring.stringify({
      sort: 'name',
    });
    return this.call('GET', `${path}?${query}`);
  }

  getChartdata(orderbookId: string, period: string) {
    period = period.toLowerCase();
    const path = constants.paths.CHARTDATA_PATH.replace('{0}', orderbookId);
    const query = querystring.stringify({
      timePeriod: period,
    });
    return this.call('GET', `${path}?${query}`);
  }
  getInspirationLists() {
    return this.call(
      'GET',
      constants.paths.INSPIRATION_LIST_PATH.replace('{0}', '')
    );
  }

  getInspirationList(type: string) {
    return this.call(
      'GET',
      constants.paths.INSPIRATION_LIST_PATH.replace('{0}', type)
    );
  }

  subscribe(channel: string, ids: string | string[], callback: any) {
    if (!this._pushSubscriptionId) {
      throw new Error('Expected to be authenticated before subscribing.');
    }

    if (Array.isArray(ids)) {
      if (
        channel === constants.channels.ORDERS ||
        channel === constants.channels.DEALS ||
        channel === constants.channels.POSITIONS
      ) {
        ids = ids.join(',');
      } else {
        throw new Error(
          `Channel ${channel} does not support multiple ids as input.`
        );
      }
    }

    if (!this._socket) {
      this._socketInit();
    }

    const subscriptionString = `/${channel}/${ids}`;
    this.on(subscriptionString, callback);

    this._socketSubscribe(subscriptionString);

    return () => {
      if (!this._pushSubscriptionId) {
        throw new Error('Expected to be authenticated before unsubscribing.');
      }

      if (!this._socket) {
        throw new Error('Expected to be initialized before unsubscribing.');
      }

      this.off(subscriptionString, callback);

      this._socketUnsubscribe(subscriptionString);
    };
  }

  placeOrder(options: PlaceOrderOptions) {
    return this.call('POST', constants.paths.ORDER_PLACE_DELETE_PATH, options);
  }

  getOrder(instrumentType: string, accountId: string, orderId: string) {
    const path = constants.paths.ORDER_GET_PATH.replace(
      '{0}',
      instrumentType.toLowerCase()
    );
    const query = querystring.stringify({
      accountId,
      orderId,
    });
    return this.call('GET', `${path}?${query}`);
  }

  editOrder(
    instrumentType: string,
    orderId: string,
    options: object & { orderCondition: string }
  ) {
    options.orderCondition = 'NORMAL';
    const path = constants.paths.ORDER_EDIT_PATH.replace(
      '{0}',
      instrumentType.toLowerCase()
    ).replace('{1}', orderId);
    return this.call('PUT', path, options);
  }

  deleteOrder(accountId: string, orderId: string) {
    const path = constants.paths.ORDER_PLACE_DELETE_PATH;
    const query = querystring.stringify({
      accountId,
      orderId,
    });
    return this.call('DELETE', `${path}?${query}`);
  }

  search(searchQuery: string, type: string) {
    let path;

    if (type) {
      path = constants.paths.SEARCH_PATH.replace('{0}', type.toUpperCase());
    } else {
      path = constants.paths.SEARCH_PATH.replace('/{0}', '');
    }

    const query = querystring.stringify({
      limit: 100,
      query: searchQuery,
    });
    return this.call('GET', `${path}?${query}`);
  }

  call(method = 'GET', path = '', data = {}) {
    const authenticationSession = this._authenticationSession;
    const securityToken = this._securityToken; // Remove dangling question mark

    if (path.slice(-1) === '?') {
      path = path.slice(0, -1);
    }

    return new Promise((resolve, reject) => {
      if (!this._authenticated) {
        reject(new Error('Expected to be authenticated before calling.'));
      } else {
        request({
          method,
          path,
          data,
          headers: {
            'X-AuthenticationSession': authenticationSession as any,
            'X-SecurityToken': securityToken as any,
          },
        })
          .then((response: any) => resolve(response.body))
          .catch((e) => reject(e));
      }
    });
  }
}

export default Avanza;
