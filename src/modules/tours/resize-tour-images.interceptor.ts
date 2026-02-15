import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import sharp from 'sharp';
import type { Request } from 'express';
import * as path from 'path';
import * as fs from 'fs';

type MulterFiles = {
  imageCover?: Express.Multer.File[];
  images?: Express.Multer.File[];
};

type ParamsWithTourId = { tourId?: string; id?: string };

type RequestWithFiles = Request & {
  files?: MulterFiles;
  body: Record<string, unknown>;
  params: ParamsWithTourId;
};

@Injectable()
export class ResizeTourImagesInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req = context.switchToHttp().getRequest<RequestWithFiles>();

    const imageCover = req.files?.imageCover?.[0];
    const images = req.files?.images;

    if (!imageCover || !images?.length) return next.handle();

    const tourId = req.params.tourId ?? req.params.id;
    if (!tourId) return next.handle();

    const now = Date.now();

    const outDir = path.resolve(process.cwd(), 'public', 'img', 'tours');
    fs.mkdirSync(outDir, { recursive: true });

    const coverName = `tour-${tourId}-${now}-cover.jpeg`;
    await sharp(imageCover.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(path.join(outDir, coverName));

    req.body.imageCover = coverName;

    const filenames = await Promise.all(
      images.map(async (img, index) => {
        const imageName = `tour-${tourId}-${now}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(path.join(outDir, imageName));

        return imageName;
      }),
    );

    req.body.images = filenames;

    return next.handle();
  }
}
