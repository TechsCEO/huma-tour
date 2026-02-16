import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import * as multer from 'multer';
import { TourService } from './tour.service';
import { CreateTourDto, UpdateTourDto } from './tour.dto';
import { AuthGuard } from '../auth/auth.gaurd';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ResizeTourImagesInterceptor } from './resize-tour-images.interceptor';
import { TopToursAliasInterceptor } from './top-tours-alias.interceptor';

@Controller()
@UseGuards(AuthGuard, RolesGuard)
export class TourController {
  constructor(private tourService: TourService) {}

  @Get('/tours')
  async getTours(): Promise<any> {
    return await this.tourService.getTours();
  }

  @Get('/tour/:tourId')
  async getTour(@Param('tourId') tourId: string): Promise<any> {
    return await this.tourService.getTour(tourId);
  }

  @Get('/tour-stats')
  async getTourStats(): Promise<any> {
    return await this.tourService.getTourStats();
  }

  @Get('/top-5-tours')
  @UseInterceptors(TopToursAliasInterceptor)
  async getTourTopTours(@Query() query: Record<string, unknown>): Promise<any> {
    const mergedQuery: Record<string, unknown> = {
      ...query,
      limit: query.limit ?? '5',
      sort: query.sort ?? '-ratingAverage,price',
      fields: query.fields ?? 'name,price,ratingAverage,summary,difficulty',
    };
    return await this.tourService.getTopTours(mergedQuery);
  }

  @Get('/monthly-plan/:year')
  @Roles('admin', 'lead-guide', 'guide')
  async getMonthlyPlan(@Param('year') year: number): Promise<any> {
    return await this.tourService.getMonthlyPlan(year);
  }

  @Get('/tours-within/:distance/center/:latlng/unit/:unit')
  async getToursWithin(
    @Param('distance') distance: number,
    @Param('latlng') latlng: string,
    @Param('unit') unit: string,
  ): Promise<any> {
    return await this.tourService.getTourWithin(distance, latlng, unit);
  }

  @Get('/distances/:latlng/unit/:unit')
  async getToursDistances(
    @Param('distance') distance: number,
    @Param('latlng') latlng: string,
    @Param('unit') unit: string,
  ): Promise<any> {
    return await this.tourService.getToursDistances(distance, latlng, unit);
  }

  @Post('/tour')
  @Roles('lead-guide', 'admin')
  async createTour(@Body() tour: CreateTourDto): Promise<any> {
    return await this.tourService.CreateTour(tour);
  }

  @Delete('/tour/:tourId')
  @Roles('lead-guide', 'admin')
  async DeleteTour(@Param('tourId') tourId: string): Promise<any> {
    return await this.tourService.deleteTour(tourId);
  }

  @Patch('/tour/:tourId')
  @Roles('lead-guide', 'admin')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageCover', maxCount: 1 },
        { name: 'images', maxCount: 3 },
      ],
      {
        storage: multer.memoryStorage(),
      },
    ),
    ResizeTourImagesInterceptor,
  )
  async UpdateTour(
    @Param('tourId') tourId: string,
    @Body() tour: UpdateTourDto,
  ): Promise<any> {
    return await this.tourService.updateTour(tourId, tour);
  }
}
