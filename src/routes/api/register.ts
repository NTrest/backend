import * as express from 'express';
import { UserModel } from '../../models/';
import * as config from '../../config';

import * as jwt from 'jsonwebtoken';

export function use(router: express.Router) {
    router.post('/register', (req, res, next) => {
        for (const removeStr of ['registrationDate', 'roles', 'passwordResetToken', 'passwordResetExpires']) {
            req.body[removeStr] = undefined;
        }

        for (const str of ['username', 'email', 'firstName', 'lastName']) {
            req.sanitizeBody(str).escape();
        }

        req.sanitizeBody('email').normalizeEmail();
        req.checkBody('username', 'Invalid username').notEmpty();
        req.checkBody('password', 'You must enter a password').notEmpty().withMessage('Password must be 8 or more characters long').isLength({min: 8});
        req.checkBody('email', 'Invalid email').isEmail();
        req.checkBody('firstName', 'Invalid first name').notEmpty();
        req.checkBody('lastName', 'Invalid last name').notEmpty();
        req.checkBody('phoneNumber', 'Invalid phone number').optional({checkFalsy: true}).isMobilePhone('en-US');

        req.getValidationResult().then((result) => {
            if (!result.isEmpty()) {
                return res.send({success: false, message: result.array()[0].msg});
            }

            UserModel.create({username: req.body.username, password: req.body.password, email: req.body.email, firstName: req.body.firstName, lastName: req.body.lastName, phoneNumber: req.body.phoneNumber}, (err, user: User) => {
                if (err) {
                    if (err.name === 'ValidationError') {
                        let x: any;
                        const errors: any = (<any>err).errors;
                        for (x in errors) {
                            const error = errors[x];
                            if (error && error.message) {
                                return res.send({success: false, message: error.message});
                            }
                        }
                    }

                    return res.send({success: false, message: 'Unknown error occurred'});
                }

                const jwt_signed = jwt.sign({username: user.username, roles: user.roles}, config.secret, {algorithm: 'HS256', expiresIn: (60 * 60 * 6)} );
                res.cookie('access_token', jwt_signed, {signed: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 6, domain: config.domain});
                return res.send({success: true, username: user.username, roles: user.roles, message: 'User created'});
            });
        });
    });
};
