import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { AppModule } from './app/app.module';
import { CmsModule } from './cms/cms.module';

@Module({
  imports: [AuthModule, DashboardsModule, AppModule, CmsModule],
  exports: [],
})
export class ApiModule {}
