import { Module, forwardRef } from '@nestjs/common';
import { SigninController } from './signin.controller';
import { SigninService } from './signin.service';
import { AuthModule } from '../auth.module';
import { AttemptModule } from 'src/providers/attempt/attempt.module';
import { ProfilesModule } from 'src/api/dashboards/user/profiles/profiles.module';

@Module({
  imports: [forwardRef(() => AuthModule), AttemptModule, ProfilesModule],
  providers: [SigninService],
  controllers: [SigninController],
})
export class SigninModule {}
