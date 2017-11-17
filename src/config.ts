import * as fs from 'fs';

export const database = 'mongodb://admin:password@url:port/db'; // TODO: Insert database info
export const secret: string = <string>fs.readFileSync('secret', 'utf8'); // TODO: Generate Secret Key
export const domain = 'ntrest.info'; // TODO: Make Domain
