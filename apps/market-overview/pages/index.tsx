import styled from '@emotion/styled';
import axios from 'axios';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import config from "../config"

export function Index() {
  const [token, setToken] = useState<{
    autostartToken: string;
    transactionId: string;
  }>();

  const [security, setSecurity] = useState()
  useEffect(() => {
    axios.get(`${config.marketMasterApiBaseUrl}/auth/bankid`, {withCredentials: true}).then(({ data }) => {
      console.log(data);
      setToken({
        autostartToken: `bankid:///?autostarttoken=${data.body.autostartToken}`,
        transactionId: data.body.transactionId,
      });
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (token?.transactionId)
        axios
          .post(`${config.marketMasterApiBaseUrl}/auth/bankid/collect`, {
            transactionId: token.transactionId,
          }, {withCredentials: true})
          .then(({ data }) => {
            console.log(data);
            if (data.body.state === 'COMPLETE') {
              clearInterval(interval);

              axios
                .post(
                  `${config.marketMasterApiBaseUrl}/auth/bankid/collect/${data.body.logins[0].customerId}`,
                  {
                    transactionId: token.transactionId,
                  },
                  {withCredentials: true}
                )
                .then(({ data }) => console.log(data));
            }
          });
    }, 5000);
    return () => clearInterval(interval);
  }, [token?.transactionId]);

  const getSecurity = () => {
    axios.get(`${config.marketMasterApiBaseUrl}/security/517316`, {withCredentials: true})
    .then(({data}) => setSecurity(data))
    .catch((error) => setSecurity(error))
  }

  return (
    <div>
      {token?.autostartToken && <QRCode value={token.autostartToken} />}
      <button onClick={() => getSecurity()}>Get Security</button>
      {security &&
        <span>{JSON.stringify(security)}</span>
      }
    </div>
  );
}

export default Index;
