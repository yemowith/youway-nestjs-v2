import { Module } from '@nestjs/common';
import { SellerModule } from './seller/seller.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [SellerModule, UserModule, AdminModule],
})
export class DashboardsModule {}
