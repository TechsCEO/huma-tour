import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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

  @Get('/tours-within/:distance/center/:latlng/unit/:unit')
  async getToursWithin(
    @Param('distance') distance: number,
    @Param('latlng') latlng: string,
    @Param('unit') unit: string,
  ): Promise<any> {
    await this.tourService.getTourWithin(distance, latlng, unit);
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
