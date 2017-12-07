import * as mongoose from 'mongoose';
import * as beautifulUnique from 'mongoose-beautiful-unique-validation';

export interface IMessage {
    username: string,
    message: string,
    timestamp: Date,
    compLoc: string
}

export const MessageSchema = new mongoose.Schema({
    username: {type: String, required: [true, 'Username is required'], lowercase: true},
    message: {type: String, required: [true, 'A message is required']},
    timestamp: {type: Date},
    compLoc: {type: String}
});

MessageSchema.pre('save', function(next) {
    const message = this;

    message.timestamp = new Date();

    next();
});

export interface Message extends IMessage, mongoose.Document {
}

export const MessageModel = mongoose.model<Message>('Message', MessageSchema);
