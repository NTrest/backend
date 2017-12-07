import * as express from 'express';
import * as expressJwt from 'express-jwt';
import * as api from './api/';
import * as config from '../config';

const router = express.Router();

router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "api.ntresapp.me");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
  });

router.use(expressJwt({secret: config.secret, getToken: (req) => {
    return req.cookies['access_token'] || req.body.token || req.params.token;
}}).unless({ext: ['/register', '/login', '/logout']}));

api.login.use(router);
api.register.use(router);
api.logout.use(router);

api.dm.use(router);

export {router as api};
