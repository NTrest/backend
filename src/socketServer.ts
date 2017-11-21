import * as sio from 'socket.io';
import * as siocookieparser from 'socket.io-cookie-parser';
import * as jwt from 'jsonwebtoken';
import * as config from './config';


class UserData {
    tokenData: any;
    location: any
}

export function use(http: any) {
    const io = sio(http);

    const map = new Map<any, UserData>();

    io.use(siocookieparser());
    io.use((socket, next) => {
        const cookie = socket.request.cookies["access_token"] || socket.request._query["token"];
        if (typeof(cookie) === 'undefined') {
            next("No Cookie");
            return;
        } 
        jwt.verify(cookie, config.secret, {algorithms: ["HS256"]}, (error, decoded) => {
            if (error) {
                console.log(cookie);
                console.error(error);
                return next(error);
            }

            console.log("User logged in: " + (<any>decoded).username);

            map.set(socket.id, <UserData>{tokenData: decoded, location: {}});
            next();
        });
    });

    io.on('connection', (socket) => {
        socket.on('send', (data:any) => {
            const isPublic = data.mode === 0;
            io.emit(isPublic ? "public" : "private", {username: map.get(socket.id).tokenData.username, message: data.message});
        });

        socket.on('locationUpdate', (data:any) => {
            map.get(socket.id).location = data.coords;
        })
    });
}