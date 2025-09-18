import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { AvatarsModule } from '../../user/profiles/avatars/avatars.module';

@Module({
  providers: [CommentsService],
  controllers: [CommentsController],
  imports: [AvatarsModule],
})
export class CommentsModule {}
