import axios from 'axios';
import config from '../../config';
import https from 'https';

const MARKETS = {
  BE_QUOTED: 'SE.Inofficiella',
  LARGE_CAP: 'SE.LargeCap.SE',
  MID_CAP: 'SE.MidCap.SE',
  NGM_PEP_MARKET: 'SE.NGM+PepMarket',
  NORDIC_SME_SWEDEN: 'SE.Nordic+SME+Sweden',
  SPAC_LIST: 'SE.SPAC.SE',
  SMALL_CAP: 'SE.SmallCap.SE',
  FIRST_NORTH: 'SE.FNSE',
  NGM: 'SE.XNGM',
  SPOTLIGHT_STOCK_MARKET: 'SE.XSAT',
  XTERNA_LISTAN: 'SE.Xterna+listan',
  NASDAQ: 'US.XNAS',
};

type SORT_ORDER = 'DESCENDING' | 'ASCENDING';

type MARKET_TYPE = keyof typeof MARKETS;

const getWinners = (
  markets: MARKET_TYPE[],
  offset: number,
  maxResults: number,
  cookies?: any
) => {
  const head = {
    cookie: cookies || '',
  };

  return axios
    .get(
      `${config.marketMasterApiBaseUrl}/market/lists?markets=${markets.join()}&offset=${offset}&maxResults=${maxResults}&sortOrder=DESCENDING&sortField=DEVELOPMENT_TODAY`,
      {
        withCredentials: true,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        headers: cookies ? head : {},
      }
    )
    .then(({ data }) => data);
};
const getLosers = (
  markets: MARKET_TYPE[],
  offset: number,
  maxResults: number,
  cookies?: any
) => {
  const head = {
    cookie: cookies || '',
  };

  return axios
    .get(
      `${config.marketMasterApiBaseUrl}/market/lists?markets=${markets.join()}&offset=${offset}&maxResults=${maxResults}&sortOrder=ASCENDING&sortField=DEVELOPMENT_TODAY`,
      {
        withCredentials: true,
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        headers: cookies ? head : {},
      }
    )
    .then(({ data }) => data);
};

export { getWinners, getLosers };
