import { Module } from '@nestjs/common';
import { CategoriesModule } from './categories/categories.module';
import { PagesModule } from './pages/pages.module';
import { MenusModule } from './menus/menus.module';

@Module({
  imports: [CategoriesModule, PagesModule, MenusModule],
})
export class CmsModule {}
