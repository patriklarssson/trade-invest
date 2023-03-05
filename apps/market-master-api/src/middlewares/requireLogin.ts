import { getUserSession } from '../services/userSessionService';

export const requireLogin = (req, res, next) => {
  if (!getUserSession(req.session.id)) {
    // return res.redirect('/login');
  }
  next();
};
