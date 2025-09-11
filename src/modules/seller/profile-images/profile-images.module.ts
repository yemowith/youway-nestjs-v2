import { Module } from '@nestjs/common';
import { ProfileImagesService } from './profile-images.service';

@Module({
  providers: [ProfileImagesService],
  exports: [ProfileImagesService],
})
export class ProfileImagesModule {}
