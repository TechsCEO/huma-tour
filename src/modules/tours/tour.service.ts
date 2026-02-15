import { Injectable, NotFoundException } from '@nestjs/common';
import { Tour, TourDocument } from './tourModel';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTourDto, UpdateTourDto } from './tour.dto';

@Injectable()
export class TourService {
  constructor(
    @InjectModel(Tour.name) private readonly tourModel: Model<TourDocument>,
  ) {}

  async getTours() {
    const tours = await this.tourModel.find().lean().exec();
    return {
      status: 'success',
      length: tours.length,
      data: {
        tours,
      },
    };
  }

  async getTourWithin(distance: number, latlng: string, unit: string) {
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
      throw new NotFoundException(
        'Please provide latitude and longitude in the format lat, long.',
      );
    }

    const tours = await this.tourModel
      .find({
        startLocation: {
          $geoWithin: {
            $centerSphere: [[lng, lat], radius],
          },
        },
      })
      .lean()
      .exec();

    return { status: 'success', size: tours.length, data: { data: tours } };
  }

  async getTour(tourId: string) {
    const tour = await this.tourModel.findOne({ _id: tourId }).lean().exec();
    return {
      status: 'success',
      data: tour,
    };
  }

  async CreateTour(tour: CreateTourDto) {
    const created = await this.tourModel.create(tour);
    return {
      status: 200,
      data: created,
    };
  }

  async deleteTour(tourId: string) {
    const deleted = await this.tourModel.deleteOne({ _id: tourId });
    return { status: deleted.deletedCount > 0 ? 200 : 404 };
  }

  async updateTour(tourId: string, tour: UpdateTourDto) {
    const doc = await this.tourModel.findById(tourId);
    if (!doc) throw new NotFoundException('Tour not found');

    doc.set(tour);
    const saved = await doc.save();

    return { status: 200, data: saved };
  }
}
