import * as nodemailer from 'nodemailer';

const instances = new Map<string, GMailService>();

export class GMailService {
    mailer: nodemailer.Transporter;

     public static Instance(email: string, password: string): GMailService {
         if (!instances.has(email)) {
             instances.set(email, new GMailService(email, password));
         }

         return instances.get(email);
     }

     public static Get(email: string): GMailService {
         if (!instances.has(email)) {
             throw new Error('Use .Instance for first creation');
         }

         return instances.get(email);
     }

    private constructor(public email: string, password: string) {
        this.mailer = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: email,
                pass: password
            },
        })
    }


    sendMail(from: string, to: string | string[], subject: string, html: string)
    {
        this.mailer.sendMail({from: '"' + from + '" <' + this.email + '>', to: ((to instanceof Array) ? to.join() : to), subject, html}, (error, info) => {
            if (error) {
                return console.error(error);
            }

            console.log('Message sent: %s', info.messageId);
        });
    }
}

