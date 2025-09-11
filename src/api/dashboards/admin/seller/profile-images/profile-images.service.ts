import { Injectable } from '@nestjs/common';
import { ProfileImagesService as BaseProfileImagesService } from 'src/modules/seller/profile-images/profile-images.service';

@Injectable()
export class ProfileImagesService extends BaseProfileImagesService {
  // Admin-specific methods can be added here if needed
  // For now, we inherit all functionality from the base service
}
