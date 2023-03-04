import dotenv from 'dotenv';
dotenv.config({ path: '../trade-invest/apps/market-master-api/.env' });
import { randomUUID } from 'crypto';
import express from 'express';
import session from 'express-session';
import { loginRouter, securityRouter } from './routes';
import { patchPaths } from './utils/monkeyPathPaths';
import fs from 'fs';
import https from 'https';

patchPaths();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: randomUUID(),
    resave: false,
    saveUninitialized: true,
  })
);

const privateKey = fs.readFileSync('C:/certs/key.pem');
const certificate = fs.readFileSync('C:/certs/cert.pem');
const server = https.createServer({ key: privateKey, cert: certificate }, app);

app.use('/login', loginRouter);
app.use('/security', securityRouter);

const port = process.env.PORT || 3333;
server.listen(port, () => {
  console.log(`Listening at https://localhost:${port}/api`);
});

server.on('error', console.error);
