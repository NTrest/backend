import * as sio from 'socket.io';
import * as siocookieparser from 'socket.io-cookie-parser';
import * as jwt from 'jsonwebtoken';
import * as config from './config';
import { DMModel, DM } from './models/';
import { MessageModel, Message } from './models/';
import { LocationService } from './services/location';


const locationService = LocationService.Instance();

class UserData {
    tokenData: any;
    location: any;
    comparableLocation: string;
    lastpull: number;
}
const map = new Map<any, UserData>();
const userMap = new Map<string, any>();
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
            userMap.set((<any>decoded).username, socket.id);
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


        socket.on('dm', (data:any) => {
            const username = data.to;
            const userID = userMap.get(username);
            const message = {message: data.message, to: username, from: map.get(socket.id).tokenData.username, timestamp: new Date()};
            
            
            DMModel.create(message, (err, dm: DM) => {
                if (err) {
                    if (err.name === 'ValidationError') {
                        let x: any;
                        const errors: any = (<any>err).errors;
                        for (x in errors) {
                            const error = errors[x];
                            if (error && error.message) {
                                console.log("ERROR: " + error.message);
                            }
                        }
                    }

                    console.error("Unknown Error occurred while sending DM");
                }

                if (!!userID) { //User is online
                    io.to(userID).emit('recvdm', message);
                }
            });

        });


        socket.on('send', (data:any) => {
            const isPublic = data.mode === 0;
            const compLoc = map.get(socket.id).comparableLocation;
            const message = {username: map.get(socket.id).tokenData.username, message: data.message, compLoc: compLoc};

            if (!isPublic) {
                return;
            }
            if (compLoc == '') {
                return socket.send('locationError', 'LOCATION MUST BE ENABLED IN YOUR BROWSER');
            }


            if (isPublic) {
                MessageModel.create(message, (err, msg: Message) => {

                    if (err) {
                        if (err.name === 'ValidationError') {
                            let x: any;
                            const errors: any = (<any>err).errors;
                            for (x in errors) {
                                const error = errors[x];
                                if (error && error.message) {
                                    return console.log("ERROR: " + error.message);
                                }
                            }
                        }
    
                        return console.error("Unknown Error occurred while adding message");
                    }



                    io.sockets.in(compLoc).emit(isPublic ? "public" : "private", {username: map.get(socket.id).tokenData.username, message: data.message});
                });
            }
        });

        socket.on('disconnect', () => {
            console.log("Disconnection: " + map.get(socket.id).tokenData.username);
            userMap.delete(map.get(socket.id).tokenData.username);
            map.delete(socket.id);
        });

        socket.on('getMsgs', () => {
            MessageModel.find({compLoc: map.get(socket.id).comparableLocation}, (err, msgs: Message[]) => {
                if (err) {
                    return console.log(err);
                }

                for (const msg in msgs) {
                    socket.emit('public', msgs[msg]);
                }

                console.log('GETMSGS');
            });
        });

        socket.on('getdms',() => {
                const curUser = map.get(socket.id).tokenData.username;
        
                DMModel.find({$or: [
                    {'to': curUser},
                    {'from': curUser}
                ]}, (err, dms: DM[]) => {
                    if (err) {
                        return console.log("ERROR");
                    }
        
                    dms.sort((a: DM, b: DM) => {
                        return a.timestamp.getTime() - b.timestamp.getTime();
                    });
                    
                    socket.emit('recvdms', dms);
                });
        });

        socket.on('locationUpdate', (data:any) => {
            if (locationTick(data)) {
                console.log(data);
                locationService.getLocation(data).then((loc) => {
                    cityChange(loc);
                    console.log(`City Changed to: ${map.get(socket.id).comparableLocation}`);
                    socket.emit('locationAccept');
                });
            }
        });
    });
}

