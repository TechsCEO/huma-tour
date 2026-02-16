// src/modules/tours/top-tours-alias.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class TopToursAliasInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const query = req.query ?? {};

    if (req.query) {
      req.query.limit ??= '5';
      req.query.sort ??= '-ratingAverage,price';
      req.query.fields ??= 'name,price,ratingAverage,summary,difficulty';
    } else {
      query.limit ??= '5';
      query.sort ??= '-ratingAverage,price';
      query.fields ??= 'name,price,ratingAverage,summary,difficulty';
    }

    return next.handle();
  }
}
