import { Injectable, NotFoundException } from '@nestjs/common';
import { Tour, TourDocument } from './tourModel';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateTourDto, UpdateTourDto } from './tour.dto';

const LATLNG_FORMAT_ERROR =
  'Please provide latitude and longitude in the format lat, long.';
const TOUR_NOT_FOUND_ERROR = 'Tour not found';

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

  async getMonthlyPlan(year: number) {
    const plan = await this.tourModel.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tour: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      } /*,
      {
        $limit: 6
      }*/,
    ]);

    return {
      status: 'success',
      length: plan.length,
      data: plan,
    };
  }

  async getTopTours(mergedQuery: Record<string, unknown>) {
    const { limit, sort, fields, ...filters } = mergedQuery as Record<
      string,
      any
    >;

    const q = this.tourModel.find(filters);

    if (typeof sort === 'string' && sort.trim()) {
      q.sort(sort.split(',').join(' '));
    }

    if (typeof fields === 'string' && fields.trim()) {
      q.select(fields.split(',').join(' '));
    }

    const limitNum = Number.parseInt(String(limit ?? 5), 10);
    q.limit(Number.isFinite(limitNum) && limitNum > 0 ? limitNum : 5);

    const tours = await q.lean().exec();
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
      throw new NotFoundException(LATLNG_FORMAT_ERROR);
    }

    const tours = await this.tourModel
      .find({
        startLocation: {
          $geoWithin: {
            $centerSphere: [[+lng, +lat], radius],
          },
        },
      })
      .lean()
      .exec();

    return { status: 'success', size: tours.length, data: { data: tours } };
  }

  async getToursDistances(distance: number, latlng: string, unit: string) {
    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
      throw new NotFoundException(LATLNG_FORMAT_ERROR);
    }
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    const tours = await this.tourModel.aggregate([
      {
        //$geoNear must be the first stage
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [+lng, +lat],
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          distance: 1,
          name: 1,
        },
      },
    ]);

    return { status: 'success', size: tours.length, data: { data: tours } };
  }

  async getTour(tourId: string) {
    const tour = await this.tourModel.findOne({ _id: tourId }).lean().exec();
    return {
      status: 'success',
      data: tour,
    };
  }

  async getTourStats() {
    const stats = await this.tourModel.aggregate([
      {
        $match: { ratingAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          //_id:  '$ratingAverage',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          averageRating: { $avg: '$ratingAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      } /*,
      {
        $match: {
          _id: { $ne: 'EASY' }
        }
      }*/,
    ]);
    return { status: 'success', data: stats };
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
    if (!doc) throw new NotFoundException(TOUR_NOT_FOUND_ERROR);

    doc.set(tour);
    const saved = await doc.save();

    return { status: 200, data: saved };
  }
}
