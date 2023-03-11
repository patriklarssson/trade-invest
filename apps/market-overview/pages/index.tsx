import styled from '@emotion/styled';
import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import config from '../config';
import { Container } from '@trade-invest/components-ui';
import { useRouter } from 'next/router';

export function Index(): JSX.Element {
  const [autostartToken, setAutostartToken] = useState<string>();
  const router = useRouter();

  const axiosOptions = { withCredentials: true };

  const startBankIdSigning = async () => {
    const { data } = await axios.get(
      `${config.marketMasterApiBaseUrl}/auth/bankid`,
      axiosOptions
    );
    setAutostartToken(`bankid:///?autostarttoken=${data.body.autostartToken}`);
    collectBankId(data.body.transactionId);
  };

  const collectBankId = async (transactionId: string): Promise<void> => {
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.post(
          `${config.marketMasterApiBaseUrl}/auth/bankid/collect`,
          { transactionId },
          axiosOptions
        );
        console.log(data);
        if (data.body.state === 'COMPLETE') {
          clearInterval(interval);
          await authAndRoute(transactionId, data.body.logins[0]?.customerId);
        }
      } catch (error) {
        handleError(error);
        clearInterval(interval);
      }
    }, 5000);
  };

  const authAndRoute = (transactionId: string, customerId: string) => {
    axios
      .post(
        `${config.marketMasterApiBaseUrl}/auth/bankid/collect/${customerId}`,
        { transactionId },
        axiosOptions
      )
      .then(() => {
        // router.push('/account/holdings');
        window.location.href = "/account/holdings"
      });
  };

  const handleError = (error: AxiosError): void => {
    console.error(error);
    alert('An error occurred. Please try again later.');
  };

  useEffect(() => {
    startBankIdSigning();
  }, []);

  return (
    <Container maxWidth="xl">
      <h1>YOO</h1>
      {autostartToken && (
        <div>
          <QRCode value={autostartToken} />
          <a href={`bankid:///?autostarttoken=${autostartToken}`}>
            Open on this device
          </a>
        </div>
      )}
    </Container>
  );
}

export default Index;
