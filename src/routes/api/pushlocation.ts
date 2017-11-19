import * as express from 'express';
import * as config from '../../config';

import * as jwt from 'jsonwebtoken';

export function use(router: express.Router) {
    router.post('/pushlocation', (req, res, next) => {
        req.checkBody('lat', 'Invalid Coordinate').notEmpty();
        req.checkBody('latcos', 'Invalid Coordinate').notEmpty();
        req.checkBody('lon', 'Invalid Coordinate').notEmpty();

        req.getValidationResult().then((result) => {
            if (!result.isEmpty()) {
                return res.send({success: false, message: result.array()[0].msg});
            }

            const username = req.user.username;

            

        });
    });
};
