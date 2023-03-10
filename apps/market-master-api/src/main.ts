import { randomUUID } from 'crypto';
import express from 'express';
import session from 'express-session';
import { authRouter, securityRouter, accountRouter } from './routes';
import fs from 'fs';
import https from 'https';
import cors from 'cors';
import config from '../config';
import { createClient } from 'redis';
import RedisStore from 'connect-redis';

const SessionCookie =
  process.env.NODE_ENV == 'dev'
    ? {
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 60 * 24 * 2, //2 day
      }
    : {
        secure: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 60 * 24 * 2, //2 day
      };

const app = express();
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const redisClient = createClient();
redisClient.connect().catch(console.error);

// Initialize store.
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'market-master-api:',
});

app.use(
  session({
    // secret: randomUUID(),
    secret: "Verycoolsecret",
    store: redisStore,
    resave: false,
    saveUninitialized: true,
    cookie: { ...SessionCookie } as any,
  })
);
console.log(config);

const privateKey = fs.readFileSync(config.ssl.key);
const certificate = fs.readFileSync(config.ssl.cert);
const server = https.createServer({ key: privateKey, cert: certificate }, app);

app.use('/auth', authRouter);
app.use('/security', securityRouter);
app.use('/account', accountRouter);

const port = process.env.PORT || 3333;
server.listen(port, () => {
  console.log(`Listening at https://localhost:${port}`);
});

server.on('error', console.error);
