import { randomUUID } from 'crypto';
import express from 'express';
import session from 'express-session';
import { authRouter, securityRouter } from './routes';
import fs from 'fs';
import https from 'https';
import cors from 'cors';
import config from "../config"

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
app.use(
  session({
    secret: randomUUID(),
    resave: false,
    saveUninitialized: true,
    cookie: { ...SessionCookie } as any,
  })
);

const privateKey = fs.readFileSync(config.ssl.key);
const certificate = fs.readFileSync(config.ssl.cert);
const server = https.createServer({ key: privateKey, cert: certificate }, app);

app.use('/auth', authRouter);
app.use('/security', securityRouter);

const port = process.env.PORT || 3333;
server.listen(port, () => {
  console.log(`Listening at https://localhost:${port}`);
});

server.on('error', console.error);
