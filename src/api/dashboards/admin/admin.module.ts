import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { AccoutingModule } from './accouting/accouting.module'
import { DefintionsModule } from './defintions/defintions.module'
import { ApplicationModule } from './application/application.module'
import { AdminsModule } from './admins/admins.module'
import { AdminService } from './admin.service'
import { AdminController } from './admin.controller'
import { SellerModule } from './seller/seller.module'
import { CmsModule } from './cms/cms.module'
import { SettingsModule } from './settings/settings.module'

@Module({
  imports: [
    UsersModule,
    AccoutingModule,
    DefintionsModule,
    ApplicationModule,
    AdminsModule,
    SellerModule,
    CmsModule,
    SettingsModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}
