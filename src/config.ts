import * as fs from 'fs';

export const database = <string>fs.readFileSync('mongourl', 'utf8');
export const secret: string = <string>fs.readFileSync('secret', 'utf8');
export const domain = 'ntrest.info';
export const gmailpass: string = <string>fs.readFileSync('gmailpass', 'utf8');

