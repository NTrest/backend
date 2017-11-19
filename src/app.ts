import * as cookieparser from 'cookie-parser';
import * as sio from 'socket.io';
import * as path from 'path';
import * as http from 'http';

import * as util from './util';
import * as routes from './routes';
import * as config from './config';

import * as mongoose from 'mongoose';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as subdomain from 'express-subdomain';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as async from 'async';
import * as beautifulUnique from 'mongoose-beautiful-unique-validation';
import * as fs from 'fs';
import * as ExpressValidator from 'express-validator';

import { GMailService } from './'

mongoose.plugin(beautifulUnique);



(<any>mongoose).Promise = global.Promise;
mongoose.connect(config.database, {useMongoClient: true})
  .then(() => console.log('DB Connection Successful'))
  .catch((err) => console.error(err));



let port: any = "3000"
let server: http.Server;
let app: express.Application;



app = express();
app.use(cookieparser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(ExpressValidator());

app.use('/', routes.api);
port = util.normalizePort(process.env.PORT || port);
app.set('port', this.port);
server = http.createServer(this.app);

server.listen(this.port);
server.on('error', this.onError);
server.on('listening', this.onListening);

function onError(error: any) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof this.port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
		console.error(bind + ' requires elevated privileges');
		process.exit(1);
		break;
		case 'EADDRINUSE':
		console.error(bind + ' is already in use');
		process.exit(1);
		break;
		default:
		throw error;
	}
}


let onListening = () => {
	const addr = this.server.address();
	const bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	console.log('Listening on ' + bind);
}

