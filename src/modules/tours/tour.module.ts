import { Module } from '@nestjs/common';
import { TourController } from './tour.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TourService } from './tour.service';
import { Tour, TourSchema } from './tourModel';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tour.name, schema: TourSchema }]),
  ],
  controllers: [TourController],
  providers: [TourService],
})
export class TourModule {}
