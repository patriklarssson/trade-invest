import { getSecurityById } from '../services/securityService';

const getSecurity = (req, res) => {
  const { securityId } = req.params;
  console.log("SECURITY", req.session.id);

  getSecurityById(req.session.id, securityId)
  .then((security) => res.send(security))
  .catch((error) => res.send(error))
};

export { getSecurity };