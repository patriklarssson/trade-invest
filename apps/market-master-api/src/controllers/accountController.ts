import { getPossitions } from '../services/accountService';

const getHoldings = (req, res, next) => {
  console.log("getHoldings", req.session.id);

  getPossitions(req.session.id)
  .then((data) => {
    console.log(data);

    res.send(data)
  })
  .catch((data) => res.send(data));
};

export { getHoldings };
