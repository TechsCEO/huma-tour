import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './reviewModel';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private readonly userModel: Model<ReviewDocument>,
  ) {}
}
