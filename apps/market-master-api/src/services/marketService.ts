import axios from 'axios';
import { getUserSession } from './userSessionService';

const getIndex = (userId: string) => {
  const avanza = getUserSession(userId).avanzaSession;
  return avanza.getIndex('19002');
};

const MARKETS = {
  BE_QUOTED: 'SE.Inofficiella',
  LARGE_CAP: 'SE.LargeCap.SE',
  MID_CAP: 'SE.MidCap.SE',
  NGM_PEP_MARKET: 'SE.NGM+PepMarket',
  NORDIC_SME_SWEDEN: 'SE.Nordic+SME+Sweden',
  SPAC_LIST: 'SE.SPAC.SE',
  SMALL_CAP: 'SE.SmallCap.SE',
  FIRST_NORTH: 'SE.FNSE',
  NGM: 'SE.XNGM',
  SPOTLIGHT_STOCK_MARKET: 'SE.XSAT',
  XTERNA_LISTAN: 'SE.Xterna+listan',
  NASDAQ: 'US.XNAS',
};

type SORT_ORDER = "DESCENDING" | "ASCENDING"


type MARKET_TYPE = keyof typeof MARKETS;

const getMarketContent = (
  markets: MARKET_TYPE[],
  offset = 0,
  maxResults = 100,
  sortOrder: SORT_ORDER,
  sortField: string
) => {
  const baseUrl =
    'https://www.avanza.se/frontend/template.html/marketing/advanced-filter/advanced-filter-template';

  const params: Record<string, string | number> = {
    'parameters.startIndex': offset,
    'parameters.maxResults': maxResults,
    'widgets.stockLists.active': 'true',
    'parameters.sortField': sortField, //'DEVELOPMENT_TODAY',
    'parameters.sortOrder': sortOrder,
  };

  markets.forEach((market, index) => {
    params[`widgets.stockLists.filter.list[${index}]`] = MARKETS[market];
  });

  const queryString = Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    )
    .join('&');

  console.log(`${queryString}`);

  return axios.get(`${baseUrl}?${queryString}`).then(({ data }) => {
    const regex = /\/order\.html\/kop\/(\d+)/g;
    const matches = data.matchAll(regex);
    const lst: string[] = [];
    for (const match of matches) {
      lst.push(match[1]);
    }
    return lst;
  });
};

export { getIndex, getMarketContent };
