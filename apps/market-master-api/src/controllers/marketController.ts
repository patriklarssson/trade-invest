import { getIndex } from "../services/marketService";


const GetIndexContent = (req, res, next) => {
  getIndex(req.session.id)
  .then((x) => res.send(x))
  .catch((e) => res.send(e))
};

export { GetIndexContent };
