import dotenv from 'dotenv';
dotenv.config({ path: '../trade-invest/apps/market-master-api/.env' });
import { randomUUID } from 'crypto';
import express from 'express';
import session from 'express-session';
import { authRouter, securityRouter } from './routes';
import { patchPaths } from './utils/monkeyPathPaths';
import fs from 'fs';
import https from 'https';
import cors from 'cors';
import axios from 'axios';
import Avanza from 'avanza';

patchPaths();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: randomUUID(),
    resave: false,
    saveUninitialized: true,
  })
);

// QR code for bankid
// bankid:///?autostarttoken=

const privateKey = fs.readFileSync('C:/certs/key.pem');
const certificate = fs.readFileSync('C:/certs/cert.pem');
const server = https.createServer({ key: privateKey, cert: certificate }, app);

app.get('/authenticatebankeid', (req, res) => {
  const avanza = new Avanza();
  avanza
    .authenticateBankId()
    .then((x) => res.send(x.body))
    .catch((x) => console.log(x));
});

app.post('/authenticatebankidcollect', (req, res) => {
  const { transactionId } = req.body;
  const avanza = new Avanza();
  avanza
    .authenticateBankIdCollect(transactionId)
    .then((x) => res.send(x))
    .catch((x) => console.log(x));
});
app.post('/authenticatebankidcollect/:customerId', (req, res) => {
  const { customerId } = req.params;
  const { transactionId } = req.body;

  console.log('customerId', customerId);
  console.log('transactionId', transactionId);

  const avanza = new Avanza();
  avanza
    .authenticateBankIdCollectCustomerId(transactionId, customerId)
    .then((x) => {

      avanza.getPositions()
      .then((x) => res.send(x))

    })
    .catch((x) => console.log(x));
});

app.use('/login', authRouter);
app.use('/security', securityRouter);

const port = process.env.PORT || 3333;
server.listen(port, () => {
  console.log(`Listening at https://localhost:${port}/api`);
});

server.on('error', console.error);
