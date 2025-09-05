import { ApiProperty } from '@nestjs/swagger';
import { PageMenuItemType } from '@prisma/client';
import { CountryDto } from 'src/modules/user/location/dto/location.dto';

export class SettingDto {
  @ApiProperty({ description: 'Setting key' })
  key: string;

  @ApiProperty({ description: 'Setting value' })
  value: string;

  @ApiProperty({ description: 'Setting group' })
  group: string;

  @ApiProperty({ description: 'Setting type' })
  type: string;
}

export class PageDto {
  @ApiProperty({ description: 'Page title' })
  title: string;

  @ApiProperty({ description: 'Page slug' })
  slug: string;
}

export class MenuItemDto {
  @ApiProperty({ description: 'Menu item ID' })
  id: string;

  @ApiProperty({ description: 'Menu item title' })
  titleItem: string;

  @ApiProperty({
    description: 'Menu item link',
    required: false,
    nullable: true,
  })
  link: string | null;

  @ApiProperty({
    description: 'Menu item type',
    enum: PageMenuItemType,
    required: false,
    nullable: true,
  })
  type: PageMenuItemType;

  @ApiProperty({
    description: 'Page',
    type: PageDto,
    required: false,
    nullable: true,
  })
  page: PageDto | null;

  @ApiProperty({ description: 'Menu item sort order' })
  sortOrder: number;

  @ApiProperty({ description: 'Menu ID' })
  menuId: string;

  @ApiProperty({ description: 'Page ID', required: false, nullable: true })
  pageId: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class MenuDto {
  @ApiProperty({ description: 'Menu ID' })
  id: string;

  @ApiProperty({ description: 'Menu title' })
  title: string;

  @ApiProperty({ description: 'Menu items' })
  items: MenuItemDto[];

  @ApiProperty({ description: 'Menu tags' })
  tags: string[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class AppResponseDto {
  @ApiProperty({ description: 'Application settings', type: [SettingDto] })
  settings: SettingDto[];

  @ApiProperty({ description: 'Application menus', type: [MenuDto] })
  menus: MenuDto[];

  @ApiProperty({ description: 'Application countries', type: [CountryDto] })
  countries: CountryDto[];
}
