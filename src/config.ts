import * as fs from 'fs';

export const database = <string>fs.readFileSync('mongourl', 'utf8').split('\n')[0];
export const secret: string = <string>fs.readFileSync('secret', 'utf8');
export const domain = '127.0.0.1';
export const gmailpass: string = <string>fs.readFileSync('gmailpass', 'utf8');
export const mapsapikey = <string>fs.readFileSync('mapsapikey', 'utf-8');
