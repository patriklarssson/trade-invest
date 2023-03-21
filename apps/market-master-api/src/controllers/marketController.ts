import { getIndex, getMarketContent } from "../services/marketService";
import { getOrderbooks } from "../services/securityService";


const GetIndexContent = (req, res, next) => {
  getIndex(req.session.id)
  .then((x) => res.send(x))
  .catch((e) => res.send(e))
};

const getMarketContents = (req, res) => {

  console.log(req.session.id);


  const { markets, sortOrder, offset, maxResults, sortField } = req.query;
  const marketList = markets.split(",")

  getMarketContent(marketList, offset, maxResults, sortOrder, sortField)
  .then((securityId) => {
    getOrderbooks(req.session.id, securityId)
    .then((data: any) => res.send(data.sort((a, b) => b.changePercent - a.changePercent)))
  })
};

export { GetIndexContent, getMarketContents };
