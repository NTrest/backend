import * as express from 'express';
import { UserModel } from '../../models/';
import * as config from '../../config';

import * as jwt from 'jsonwebtoken';

export function use(router: express.Router) {
    router.post('/login', (req, res, next) => {
        req.checkBody('username', 'Invalid username').notEmpty();
        req.checkBody('password', 'Invalid Password').notEmpty();


        req.getValidationResult().then((result) => {
            if (!result.isEmpty()) {
                return res.send({success: false, message: result.array()[0].msg});
            }

            UserModel.findOne({username: req.body.username.toLowerCase()}, (err, user) => {
                if (err) {
                    console.log(err);
                    return next(err);
                }

                if (!user) {
                    return res.send({success: false, message: 'Invalid username or password'});
                }

                user.comparePassword(req.body.password, (err, isMatch) => {
                    if (err) {
                        return next(err);
                    }

                    if (isMatch) {
                        const jwt_signed = jwt.sign({username: user.username, roles: user.roles}, config.secret, {algorithm: 'HS256', expiresIn: (60 * 60 * 6)} );
                        res.cookie('access_token', jwt_signed, {signed: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 6, domain: config.domain});
                        res.send({success: true, username: user.username, roles: user.roles, message: 'Login successful', token: jwt_signed});
                    } else {
                        res.send({success: false, message: 'Invalid username or password'});
                    }
                });
            });
        });
    });
};
