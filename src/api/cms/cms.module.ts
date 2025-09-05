import { Module } from '@nestjs/common';
import { MenuModule } from './menu/menu.module';
import { PageModule } from './page/page.module';

@Module({
  imports: [MenuModule, PageModule],
})
export class CmsModule {}
