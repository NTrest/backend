import * as fs from 'fs';

export const database = 'mongodb://admin:XKs89uDYh0PM@ds243085.mlab.com:43085/thedatabase';
export const secret: string = <string>fs.readFileSync('secret', 'utf8');
export const domain = 'ntrestapp.me';
