import * as sio from 'socket.io';
import * as siocookieparser from 'socket.io-cookie-parser';
import * as jwt from 'jsonwebtoken';
import * as config from './config';


export function use(http: any) {
    const io = sio(http);

    const map = new Map<any, any>();

    io.use(siocookieparser());
    io.use((socket, next) => {
        console.log('attempt connect');
        console.log(socket.request.cookies);
        const cookie = socket.request.cookies["access_token"];
        jwt.verify(cookie, config.secret, {algorithms: ["HS256"]}, (error, decoded) => {
            if (error) {
                return next(error);
            }

            map.set(socket.id, decoded);
            next();
        });
    });

    io.on('connection', (socket) => {
        socket.on('send', (data:any) => {
            const isPublic = data.mode === 0;
            io.emit(isPublic ? "public" : "private", {username: map.get(socket.id).username, message: data.message});
        })
    });
}