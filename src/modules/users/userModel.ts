// src/modules/users/userModel.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: [true, 'Name Is Required!'] })
  name: string;

  @Prop({
    required: [true, 'Email Is Required!'],
    unique: [true, 'User With This Email Already Registered!'],
    lowercase: true,
    validate: [validator.isEmail, 'Please Provide A Valid Email!'],
  })
  email: string;

  @Prop({
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  })
  role: string;

  @Prop({
    default: true,
    select: false,
  })
  active: boolean;

  @Prop()
  photo: string;

  @Prop({
    required: [true, 'Password Is Required!'],
    minlength: 8,
    select: false,
  })
  password: string;

  @Prop({
    required: false,
    validate: {
      validator: function (this: User, el: string): boolean {
        return el === this.password;
      },
      message: 'Confirmation Password Does Not Match!',
    },
  })
  passwordConfirm?: string;

  @Prop()
  passwordChangedAt: Date;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  correctPassword(password: string, userPassword: string): Promise<boolean> {
    return bcrypt.compare(password, userPassword);
  }

  createPasswordResetToken(this: UserDocument) {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (this: UserDocument) {
  // If Password is actually modified!
  if (!this.isModified('password')) {
    return;
  }

  // Hash The Password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete PasswordConfirm Field
  this.passwordConfirm = undefined;
  // next();
});

UserSchema.pre('save', function (this: UserDocument) {
  if (!this.isModified('password') || this.isNew) return;
  this.passwordChangedAt = new Date(Date.now() - 1000);
});

UserSchema.pre(/^find/, function (this: mongoose.Query<any, User>) {
  // "this" points to current query
  this.find({ active: { $ne: false } });
});

UserSchema.methods.createPasswordResetToken = function (this: UserDocument) {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

UserSchema.methods.correctPassword = async function (
  password: string,
  userPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(password, userPassword);
};
