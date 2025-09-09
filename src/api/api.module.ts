import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { AppModule } from './app/app.module';
import { CmsModule } from './cms/cms.module';
import { ApplicationModule } from './application/application.module';

@Module({
  imports: [AuthModule, DashboardsModule, AppModule, CmsModule, ApplicationModule],
  exports: [],
})
export class ApiModule {}
