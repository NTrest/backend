import * as sio from 'socket.io';
import * as siocookieparser from 'socket.io-cookie-parser';
import * as jwt from 'jsonwebtoken';
import * as config from './config';
import { LocationService } from './services/location';


const locationService = LocationService.Instance();

class UserData {
    tokenData: any;
    location: any;
    comparableLocation: string;
    lastpull: number;
}
const map = new Map<any, UserData>();
export function use(http: any) {
    const io = sio(http);



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

            map.set(socket.id, <UserData>{tokenData: decoded, location: {}, comparableLocation: '', lastpull: 0});
            next();
        });
    });

    io.on('connection', (socket) => {

        const cityChange = (loc) => {
            const socketData = map.get(socket.id);
            const newLoc = locationService.getCityComparable(loc);
            const oldLoc = socketData.comparableLocation;
        
            if (oldLoc !== '' && newLoc !== oldLoc) {
                socket.leave(oldLoc);
            }
            
            socketData.comparableLocation = newLoc;
            socket.join(newLoc);
        };

        const locationTick = (data) => {
            const socketData = map.get(socket.id);
            if (new Date().getTime() - socketData.lastpull < 60*1*1000) {
                return false;
            }

            const oldLoc = socketData.location;
            socketData.location = data;
            socketData.lastpull = new Date().getTime();
            console.log("TICK");

            if (locationService.getDistanceSq(data, oldLoc) < 100) {
                return false;
            }

            return true;
        }



        socket.on('send', (data:any) => {
            const isPublic = data.mode === 0;
            const compLoc = map.get(socket.id).comparableLocation;
            if (compLoc == '') {
                return socket.send('locationError', 'LOCATION MUST BE ENABLED IN YOUR BROWSER');
            }
            io.sockets.in(compLoc).emit(isPublic ? "public" : "private", {username: map.get(socket.id).tokenData.username, message: data.message});
        });

        socket.on('disconnect', () => {
            console.log("Disconnection: " + map.get(socket.id).tokenData.username);
            map.delete(socket.id);
        });

        socket.on('locationUpdate', (data:any) => {

            if (locationTick(data)) {
                console.log(data);
                locationService.getLocation(data).then((loc) => {
                    cityChange(loc);
                    console.log(`City Changed to: ${map.get(socket.id).comparableLocation}`);
                });
            }
        });
    });
}

