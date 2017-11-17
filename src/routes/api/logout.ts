import * as express from 'express';
import { UserModel } from '../../models/';
import * as config from '../../config';

import * as jwt from 'jsonwebtoken';

export function use(router: express.Router) {
    router.post('/logout', (req, res, next) => {
        res.cookie('access_token', '', {maxAge: 0});
        res.send({success: true, message: 'Logged out'});
    });
};
