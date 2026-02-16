import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TourModule } from './modules/tours/tour.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/users/user.module';
import { ReviewModule } from './modules/reviews/review.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forRoot(String(process.env.DB_URL)),
    TourModule,
    UserModule,
    ReviewModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
