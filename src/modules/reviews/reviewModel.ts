import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../users/userModel';
import { Tour } from '../tours/tourModel';

export type ReviewDocument = HydratedDocument<Review>;

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Review {
  @Prop({ required: [true, 'Review Message Is Required!'] })
  review: string;

  @Prop({
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
  })
  rating: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } })
  user: User;

  @Prop({ type: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour' } })
  tour: Tour;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

ReviewSchema.pre(/^find/, function (this: mongoose.Query<any, Review>) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
});
