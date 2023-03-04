export interface Security {
  orderbookId: string;
  name: string;
  isin: string;
  instrumentId: string;
  sectors: Sector[];
  tradable: string;
  listing: Listing;
  historicalClosingPrices: HistoricalClosingPrices;
  keyIndicators: KeyIndicators;
  quote: Quote;
  type: string;
}

interface HistoricalClosingPrices {
  oneDay: number;
  oneWeek: number;
  oneMonth: number;
  threeMonths: number;
  startOfYear: number;
  oneYear: number;
  threeYears: number;
  start: number;
  startDate: Date;
}

interface KeyIndicators {
  numberOfOwners: number;
  reportDate: Date;
  directYield: number;
  volatility: number;
  beta: number;
  priceEarningsRatio: number;
  priceSalesRatio: number;
  returnOnEquity: number;
  returnOnTotalAssets: number;
  equityRatio: number;
  capitalTurnover: number;
  operatingProfitMargin: number;
  netMargin: number;
  marketCapital: EarningsPerShare;
  equityPerShare: EarningsPerShare;
  turnoverPerShare: EarningsPerShare;
  earningsPerShare: EarningsPerShare;
  dividend: Dividend;
  dividendsPerYear: number;
  nextReport: Report;
  previousReport: Report;
}

interface Dividend {
  exDate: Date;
  paymentDate: Date;
  amount: number;
  currencyCode: string;
  exDateStatus: string;
}

interface EarningsPerShare {
  value: number;
  currency: string;
}

interface Report {
  date: Date;
  reportType: string;
}

interface Listing {
  shortName: string;
  tickerSymbol: string;
  countryCode: string;
  currency: string;
  marketPlaceCode: string;
  marketPlaceName: string;
  marketListName: string;
  tickSizeListId: string;
  marketTradesAvailable: boolean;
}

interface Quote {
  last: number;
  highest: number;
  lowest: number;
  change: number;
  changePercent: number;
  timeOfLast: number;
  totalValueTraded: number;
  totalVolumeTraded: number;
  updated: number;
  volumeWeightedAveragePrice: number;
}

interface Sector {
  sectorId: string;
  sectorName: string;
}
