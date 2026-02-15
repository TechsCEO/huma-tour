import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from '../users/userModel';
import slugify from 'slugify';

export type TourDocument = HydratedDocument<Tour>;

@Schema({
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Tour {
  @Prop({
    type: String,
    required: true,
    unique: true,
    trim: true,
  })
  name: string;

  @Prop()
  slug: string;

  @Prop({
    type: Number,
    unique: false,
    required: [true, 'A Tour Duration Is Required!'],
    min: [1, 'duration must be equal or above 1'],
  })
  duration: number;

  @Prop({
    type: Number,
    required: [true, 'A Group Size Is Required'],
  })
  maxGroupSize: number;

  @Prop({
    type: String,
    required: [true, 'Tour Must Have Difficulty'],
    trim: true,
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: "difficulty must be either: 'easy', 'medium' or 'difficult'",
    },
  })
  difficulty: string;

  @Prop({
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    set: (val: number) => Math.round(val * 10) / 10,
  })
  ratingsAverage: number;

  @Prop({
    type: Number,
    default: 0,
  })
  ratingsQuantity: number;

  @Prop({
    type: Number,
    default: 4.5,
  })
  rating: number;

  @Prop({
    type: Number,
    required: [true, 'A tour must have a price'],
  })
  price: number;

  @Prop({
    type: Number,
    validate: function (this: Tour, val: number) {
      return val < this.price;
    },
  })
  priceDisCount: number;

  @Prop({
    type: String,
    required: [true, 'Tour Must Have Summary'],
    trim: true,
  })
  summary: string;

  @Prop({
    type: String,
    trim: true,
  })
  description: string;

  @Prop({
    type: String,
    required: [true, 'A tour must have image cover'],
  })
  imageCover: string;

  @Prop()
  images: [string];

  @Prop({ type: Date, default: Date.now, select: false })
  createdAt: Date;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  guides: User[];

  @Prop()
  startDates: Date[];

  @Prop({
    type: Boolean,
    default: false,
  })
  secretTour: boolean;

  @Prop({
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: [Number],
    address: String,
    description: String,
  })
  startLocation: {
    type: 'Point';
    coordinates: number[];
    address?: string;
    description?: string;
  };

  @Prop({
    type: [
      {
        type: { type: String, default: 'Point', enum: ['Point'] },
        coordinates: { type: [Number] },
        address: { type: String },
        description: { type: String },
        day: { type: Number },
      },
    ],
  })
  locations: {
    type: 'Point';
    coordinates: number[];
    address?: string;
    description?: string;
    day?: number;
  }[];
}

export const TourSchema = SchemaFactory.createForClass(Tour);

TourSchema.pre(/^find/, function (this: mongoose.Query<any, Tour>) {
  this.populate({ path: 'guides', select: '-__v -passwordChangedAt' });
});

/*TourSchema.pre(/^find/, function (this: mongoose.Query<any, Tour>) {
  this.populate({ path: 'reviews', select: '-__v -passwordChangedAt' });
});*/

/*TourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', // field in reviewModel
  localField: '_id', // field in tourModel to connect to tour filed in reviewModel
});*/

TourSchema.virtual('durationWeeks').get(function (this: TourDocument) {
  return this.duration / 7;
});

TourSchema.pre('save', function (this: TourDocument) {
  this.slug = slugify(this.name, { lower: true });
});

TourSchema.index({ price: 1, ratingsAverage: -1 }); //compound indexes
TourSchema.index({ slug: 1 }); //single field index
TourSchema.index({ startLocation: '2dsphere' });
