import styled from '@emotion/styled';
import axios from 'axios';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';

export function Index() {
  const [token, setToken] = useState<{
    autostartToken: string;
    transactionId: string;
  }>();

  useEffect(() => {
    axios.get('https://localhost:3333/authenticatebankeid').then(({ data }) => {
      console.log(data);
      setToken({
        autostartToken: `bankid:///?autostarttoken=${data.autostartToken}`,
        transactionId: data.transactionId,
      });
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (token?.transactionId)
        axios
          .post('https://localhost:3333/authenticatebankidcollect', {
            transactionId: token.transactionId,
          })
          .then(({ data }) => {
            console.log(data);
            if (data.body.state === 'COMPLETE') {
              clearInterval(interval);

              axios.post(`https://localhost:3333/authenticatebankidcollect/${data.body.logins[0].customerId}`, {
                transactionId: token.transactionId,
              })
              .then(({data}) => console.log(data))

            }
          });
    }, 5000);
    return () => clearInterval(interval);
  }, [token?.transactionId]);

  return (
    <div>
      {token?.autostartToken && <QRCode value={token.autostartToken} />}
      <h3>{JSON.stringify(token)}</h3>
    </div>
  );
}

export default Index;
