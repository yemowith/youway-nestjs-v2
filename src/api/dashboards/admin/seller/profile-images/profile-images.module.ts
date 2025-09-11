import { Module } from '@nestjs/common';
import { ProfileImagesService } from './profile-images.service';
import { ProfileImagesController } from './profile-images.controller';
import { ProfileImagesModule as BaseProfileImagesModule } from 'src/modules/seller/profile-images/profile-images.module';

@Module({
  imports: [BaseProfileImagesModule],
  providers: [ProfileImagesService],
  controllers: [ProfileImagesController],
  exports: [ProfileImagesService],
})
export class ProfileImagesModule {}
