import * as express from 'express';
import { DMModel, DM } from '../../models/';
import * as config from '../../config';

import * as jwt from 'jsonwebtoken';

export function use(router: express.Router) {
    router.post('/dm', (req, res, next) => {
        const otherUser = req.body.user;
        const curUser = req.body.username;

        DMModel.find({$or: [
            {'to': curUser, 'from': otherUser},
            {'to': otherUser, 'from': curUser}
        ]}, (err, dms: DM[]) => {
            if (err) {
                return next(err);
            }

            dms.sort((a: DM, b: DM) => {
                return a.timestamp.getMilliseconds() - b.timestamp.getMilliseconds();
            });
            
            return res.json({success: true, dms: dms});
        });
    });
};
