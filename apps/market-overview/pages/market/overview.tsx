import { Security } from '../../features/security/models/Security';
import config from '../../config';
import axios from 'axios';
import https from 'https';
import { Divider, Stack, Typography } from '@trade-invest/components-ui';

export default function SecurityDetailPage({ index }) {
  return (
    <div>
      <Stack divider={<Divider />}>
        {index.constituents.map((x, i) => (
          <div key={i} style={{display: "flex", justifyContent: "space-between"}}>
            <Typography variant="body1">{x.name}</Typography>
            <Typography variant="body1">{(x.changePercent * 100).toFixed(2)}%</Typography>
          </div>
        ))}
      </Stack>
    </div>
  );
}

export async function getServerSideProps({ req }) {
  const index = await axios
    .get(`${config.marketMasterApiBaseUrl}/market`, {
      withCredentials: true,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: {
        cookie: req.headers.cookie || '',
      },
    })
    .then(({ data }) => data)
    .catch(() => null);

  return { props: { index } };
}
