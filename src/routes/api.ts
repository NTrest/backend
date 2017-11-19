import * as express from 'express';
import * as expressJwt from 'express-jwt';
import * as api from './api/';
import * as config from '../config';

const router = express.Router();

router.use(expressJwt({secret: config.secret, getToken: (req) => {
    return req.cookies['access_token'];
}}).unless({path: ['/register', '/login', '/logout']}));

api.login.use(router);
api.register.use(router);

export {router as api};
