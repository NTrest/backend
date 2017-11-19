import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt-nodejs';
import * as beautifulUnique from 'mongoose-beautiful-unique-validation';
const SALT_WORK_FACTOR = 10;

export interface IUserRole {
    role_id: number
}

export interface IUser {
    username: string,
    password: string,
    email: string,
    firstName: string,
    lastName: string,
    registrationDate: Date
    phoneNumber: string,
    roles: [IUserRole],
    passwordResetToken: string,
    passwordResetExpires: Date
}

export const UserRoleSchema = new mongoose.Schema({
    role_id: Number
});

export const UserSchema = new mongoose.Schema({
    username: {type: String, required: [true, 'Username is required'], unique: 'Username already taken', lowercase: true},
    password: {type: String, required: [true, 'Password is required']},
    email: {
        type: String,
        required: [true, 'Email is required'],
        validate: {
            validator: function(v) {
                return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
            },
            message: '{VALUE} is not a valid email'
        },
        lowercase: true,
        unique: 'Email already in use'
    },
    firstName: {type: String, required: [true, 'First name is required']},
    lastName: {type: String, required: [true, 'Last name is required']},
    registrationDate: {type: Date, default: Date.now()},
    phoneNumber: String,
    roles: {type: [UserRoleSchema], default: [0]},
    passwordResetToken: String,
    passwordResetExpires: Date
});

UserSchema.pre('save', function(next) {
    const user = this;

    if (!user.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) {
            return next(err);
        }

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candiatePassword, cb) {
    bcrypt.compare(candiatePassword, this.password, function(err, isMatch) {
        if (err) {
            return cb(err);
        }

        cb(null, isMatch);
    });
};

export interface User extends IUser, mongoose.Document {
    comparePassword: (candidate, cb) => void;
}

//UserSchema.plugin(beautifulUnique);

export const UserModel = mongoose.model<User>('User', UserSchema);