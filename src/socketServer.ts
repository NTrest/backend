import * as sio from 'socket.io';
import * as siocookieparser from 'socket.io-cookie-parser';
import * as jwt from 'jsonwebtoken';
import * as config from './config';
import { LocationService } from './services/location';


const locationService = LocationService.Instance();

class UserData {
    tokenData: any;
    location: any;
    city: string;
    state: string;
    lastpull: number;
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

            map.set(socket.id, <UserData>{tokenData: decoded, location: {}, city: '', state: ''});
            next();
        });
    });

    io.on('connection', (socket) => {
        socket.on('send', (data:any) => {
            const isPublic = data.mode === 0;
            io.emit(isPublic ? "public" : "private", {username: map.get(socket.id).tokenData.username, message: data.message});
        });

        socket.on('disconnect', () => {
            console.log("Disconnection: " + map.get(socket.id).tokenData.username);
            map.delete(socket.id);
        });

        socket.on('locationUpdate', (data:any) => {
            if (!!map.get(socket.id)) {
                if (!!map.get(socket.id).lastpull && new Date().getTime() - map.get(socket.id).lastpull < 60*1*1000) {
                    return;
                }

                if (locationService.getDistanceSq(data, map.get(socket.id).location) < 100) {
                    map.get(socket.id).location = data;
                    map.get(socket.id).lastpull = new Date().getTime();
                    return;
                }
            }

            console.log(data);

            map.get(socket.id).location = data;
            map.get(socket.id).lastpull = new Date().getTime();

            locationService.getLocation(data).then((loc) => {
                console.log(loc);
                map.get(socket.id).city = loc.city; // TODO: Add Location Service
                map.get(socket.id).state = loc.administrativeLevels.level1long; // TODO: Add Location Service State
            });


        })
    });
}