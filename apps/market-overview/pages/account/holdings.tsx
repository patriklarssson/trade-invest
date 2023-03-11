import { Security } from '../../features/security/models/Security';
import config from '../../config';
import axios from 'axios';
import https from 'https';
import { Typography } from '@trade-invest/components-ui';

export default function SecurityDetailPage({ holdings }) {
  return (
    <div>
      {holdings && (
        <div>

          <Typography variant='h6'>totalBalance: {holdings.totalBalance}</Typography>
          <Typography variant='h6'>totalBuyingPower: {holdings.totalBuyingPower}</Typography>
          <Typography variant='h6'>totalOwnCapital: {holdings.totalOwnCapital}</Typography>
          <Typography variant='h6'>totalProfit: {holdings.totalProfit}</Typography>
          <Typography variant='h6'>totalProfitPercent: {holdings.totalProfitPercent}</Typography>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps({ req }) {
  const holdings = await axios
    .get(`${config.marketMasterApiBaseUrl}/account/holdings`, {
      withCredentials: true,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        cookie: req.headers.cookie || '',
      },
    })
    .then(({ data }) => data)
    .catch(() => null);

  return { props: { holdings } };
}
