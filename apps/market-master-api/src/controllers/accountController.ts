import { getPossitions } from '../services/accountService';

const getHoldings = (req, res, next) => {
  console.log("getHoldings", req.session.id);

  console.log('Cookies: ', req.cookies)


  getPossitions(req.session.id)
  .then((data) => {
    res.send(data)
  })
  .catch((data) => res.send(data));
};

export { getHoldings };
