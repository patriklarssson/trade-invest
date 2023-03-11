import { getPossitions } from '../services/accountService';

const getHoldings = (req, res, next) => {
  getPossitions(req.session.id)
  .then((data) => {
    res.send(data)
  })
  .catch((data) => res.send(data));
};

export { getHoldings };
