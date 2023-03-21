import { Security } from '../../features/security/models/Security';
import config from '../../config';
import axios from 'axios';
import https from 'https';
import { Divider, Grid, Stack, Typography } from '@trade-invest/components-ui';
import { getLosers, getWinners } from '../../features/market/marketService';
import { useEffect, useState } from 'react';

const lists = [
  'BE_QUOTED',
  'LARGE_CAP',
  'MID_CAP',
  'NGM_PEP_MARKET',
  'NORDIC_SME_SWEDEN',
  'SPAC_LIST',
  'SMALL_CAP',
  'FIRST_NORTH',
  'NGM',
  'SPOTLIGHT_STOCK_MARKET',
  'XTERNA_LISTAN',
  'NASDAQ',
];

export default function SecurityDetailPage({ winners, losers, cookie }) {
  const [winner, setWinner] = useState(winners);
  const [loser, setLosers] = useState(losers);

  useEffect(() => {
    document.cookie = cookie;
  }, []);

  const [list, setList] = useState('MID_CAP');

  const handleChange = async (e) => {
    const w = await getWinners([e as any], 0, 10);
    const l = await getLosers([e as any], 0, 10);
    setWinner(w);
    setLosers(l);
    setList(e);
  };

  return (
    <div>
      <select value={list} onChange={(e) => handleChange(e.target.value)}>
        {lists.map((x, i) => (
          <option key={i} value={x}>{x}</option>
        ))}
      </select>

      <Grid container>
        <Grid columns={{ sm: 12, md: 6 }} spacing={4}>
          <Typography variant="h4">Winners</Typography>
          <Stack divider={<Divider />}>
            {winner.map((x, i) => (
              <div
                key={i}
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <Typography variant="body1">{x.name}</Typography>
                <Typography variant="body1">
                  {x.changePercent.toFixed(2)}%
                </Typography>
              </div>
            ))}
          </Stack>
        </Grid>
        <Grid columns={{ sm: 12, md: 6 }} spacing={4}>
          <Typography variant="h4">Losers</Typography>
          <Stack divider={<Divider />}>
            {loser.map((x, i) => (
              <div
                key={i}
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <Typography variant="body1">{x.name}</Typography>
                <Typography variant="body1">
                  {x.changePercent.toFixed(2)}%
                </Typography>
              </div>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
}

export async function getServerSideProps({ req }) {
  const winners = await getWinners(['MID_CAP'], 0, 10, req.headers.cookie);
  const losers = await getLosers(['MID_CAP'], 0, 10, req.headers.cookie);
  // document.cookie = req.headers.cookie
  return { props: { winners, losers, cookie: req.headers.cookie } };
}
