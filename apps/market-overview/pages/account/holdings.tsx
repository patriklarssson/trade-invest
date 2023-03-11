import { Security } from '../../features/security/models/Security';
import config from '../../config';
import axios from 'axios';
import https from 'https';

export default function SecurityDetailPage({ holdings }) {
  return (
    <div>
      {holdings && (
        <div>
          <h3>totalBalance: {holdings.totalBalance}</h3>
          <h3>totalBuyingPower: {holdings.totalBuyingPower}</h3>
          <h3>totalOwnCapital: {holdings.totalOwnCapital}</h3>
          <h3>totalProfit: {holdings.totalProfit}</h3>
          <h3>totalProfitPercent: {holdings.totalProfitPercent}</h3>
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps({ req }) {
  console.log('req.headers', req.headers);

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
