import * as cookieparser from 'cookie-parser';
import * as sio from 'socket.io';
import * as path from 'path';
import * as fs from 'fs';

var privateKey  = fs.readFileSync('server.key', 'utf8');
var certificate = fs.readFileSync('server.crt', 'utf8');

const credentials = {key: privateKey, cert: certificate};

import * as https from 'https';
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

import * as ExpressValidator from 'express-validator';
import * as socketServer from './socketServer';

import { GMailService } from './services/mailer';

mongoose.plugin(beautifulUnique);



(<any>mongoose).Promise = global.Promise;
mongoose.connect(config.database, {useMongoClient: true})
  .then(() => console.log('DB Connection Successful'))
  .catch((err) => console.error(err));



let port: any = "3000";
let httpsPort: any = "3001";
let server: http.Server;
let httpsserver: https.Server;
let app: express.Application;



app = express();
app.use(cookieparser());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(ExpressValidator());



app.use('/api', routes.api);
port = util.normalizePort(process.env.PORT || port);
app.set('port', port);


/*app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "localhost");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
  });//*/


httpsserver = https.createServer(credentials, app);
server = http.createServer(app);

httpsserver.listen(httpsPort);
server.listen(port);
httpsserver.on('error', onError);
httpsserver.on('listening', onListening);
server.on('error', onError);
server.on('listening', onListening);

socketServer.use(server);

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

function onListening() {
	const addr = server.address();
	const bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	console.log('Listening on ' + bind);
}

//GMailService.Instance("ntrest2017@gmail.com", config.gmailpass).sendMail("NTREST!!!", ["lichtensteinmp@gmail.com"], "Ntrest TEST", "<h1>NTREST!!!</h1>");
