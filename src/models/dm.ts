import * as mongoose from 'mongoose';
import * as beautifulUnique from 'mongoose-beautiful-unique-validation';

export interface IDM {
    to: string,
    message: string,
    timestamp: Date,
    from: string,
}

export const DMSchema = new mongoose.Schema({
    to: {type: String, required: [true, 'A receiver username is required'], lowercase: true},
    message: {type: String, required: [true, 'A message is required']},
    timestamp: {type: Date},
    from: {type: String, required: [true, 'A sender is required']},
});

DMSchema.pre('save', function(next) {
    const message = this;

    message.timestamp = new Date();

    next();
});

export interface DM extends IDM, mongoose.Document {
}

export const DMModel = mongoose.model<DM>('DM', DMSchema);
