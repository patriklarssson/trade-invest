import styled from '@emotion/styled';
import axios, { AxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import config from '../config';
import {
  Container,
  Grid,
  Modal,
  Paper,
  Typography,
} from '@trade-invest/components-ui';
import { useRouter } from 'next/router';
import ReactDOM from 'react-dom';

export function Index(): JSX.Element {
  const [autostartToken, setAutostartToken] = useState<string>();
  const collectIntervalRef = useRef(null);
  const router = useRouter();

  const axiosOptions = { withCredentials: true };

  const sameBankId = async () => {
    const { data } = await axios.get(
      `${config.marketMasterApiBaseUrl}/auth/bankid`,
      axiosOptions
    );
    window.location.href = `bankid:///?autostarttoken=${data.body.autostartToken}`
    collectBankId(data.body.transactionId);
  }

  const startBankIdSigning = async () => {
    const { data } = await axios.get(
      `${config.marketMasterApiBaseUrl}/auth/bankid`,
      axiosOptions
    );
    setAutostartToken(`bankid:///?autostarttoken=${data.body.autostartToken}`);
    collectBankId(data.body.transactionId);
  };

  const collectBankId = async (transactionId: string): Promise<void> => {
    collectIntervalRef.current = setInterval(async () => {
      axios
        .post(
          `${config.marketMasterApiBaseUrl}/auth/bankid/collect`,
          { transactionId },
          axiosOptions
        )
        .then(({ data }) => {
          if (data.body.state === 'COMPLETE') {
            clearInterval(collectIntervalRef.current);
            authAndRoute(transactionId, data.body.logins[0]?.customerId);
          }
          if (data.body.statusCode === 500) {
            clearInterval(collectIntervalRef.current);
            startBankIdSigning();
          }
        });
    }, 1000);
  };

  const authAndRoute = (transactionId: string, customerId: string) => {
    axios
      .post(
        `${config.marketMasterApiBaseUrl}/auth/bankid/collect/${customerId}`,
        { transactionId },
        axiosOptions
      )
      .then(() => {
        router.push('/market/overview');
        // router.push('/account/holdings');
      });
  };

  const Button = styled.button(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    borderRadius: '10px',
    padding: theme.spacing(2),
    border: '1px solid #808080',
    width: '50%',
    minWidth: 300,
    ':hover': {
      cursor: 'pointer',
    },
  }));

  const [isOpen, setIsOpen] = useState(false);

  const openBankIdSigning = () => {
    startBankIdSigning();
    setIsOpen(true);
  };
  const closeBankIdSigning = () => {
    setIsOpen(false);
    clearInterval(collectIntervalRef.current);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '70vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Modal open={isOpen} onClose={closeBankIdSigning}>
        <Paper
          p={5}
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
        >
          {autostartToken && <QRCode value={autostartToken} />}
          <Typography variant="caption" pt={4}>
            Scan the QR Code with you BankID app
          </Typography>
        </Paper>
      </Modal>

      <Grid container spacing={3}>
        <Grid>
          <Typography align="center" variant="h3">
            Login to Your Account
          </Typography>
        </Grid>
        <Grid justifyContent="center" display="flex">
          <Button onClick={openBankIdSigning}>
            <Typography variant="h6">BankId on other device</Typography>
          </Button>
        </Grid>
        <Grid justifyContent="center" display="flex">
          <Button>
            <Typography onClick={sameBankId} variant="h6">Open BankId</Typography>
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

export default Index;
