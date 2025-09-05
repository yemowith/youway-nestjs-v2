import { ApiProperty } from '@nestjs/swagger';

export class PageCategoryDto {
  @ApiProperty({ description: 'Category ID' })
  id: string;

  @ApiProperty({ description: 'Category title' })
  title: string;
}

export class RelatedPageDto {
  @ApiProperty({ description: 'Page ID' })
  id: string;

  @ApiProperty({ description: 'Page title' })
  title: string;

  @ApiProperty({ description: 'Page slug' })
  slug: string;

  @ApiProperty({ description: 'Page status' })
  status: string;

  @ApiProperty({ description: 'Page image URL', required: false, nullable: true })
  image: string | null;
}

export class PageResponseDto {
  @ApiProperty({ description: 'Page ID' })
  id: string;

  @ApiProperty({ description: 'Page title' })
  title: string;

  @ApiProperty({ description: 'Page slug' })
  slug: string;

  @ApiProperty({ description: 'Category ID' })
  categoryId: string;

  @ApiProperty({ description: 'Page category information' })
  category: PageCategoryDto;

  @ApiProperty({ description: 'Page template', default: 'default' })
  template: string;

  @ApiProperty({ description: 'Page content' })
  content: string;

  @ApiProperty({ description: 'Page status', default: 'published' })
  status: string;

  @ApiProperty({ description: 'Page image URL', required: false, nullable: true })
  image: string | null;

  @ApiProperty({ description: 'SEO title', required: false, nullable: true })
  seoTitle: string | null;

  @ApiProperty({ description: 'SEO description', required: false, nullable: true })
  seoDescription: string | null;

  @ApiProperty({ description: 'SEO keywords', required: false, nullable: true })
  seoKeywords: string | null;

  @ApiProperty({ description: 'SEO image URL', required: false, nullable: true })
  seoImage: string | null;

  @ApiProperty({ description: 'SEO URL', required: false, nullable: true })
  seoUrl: string | null;

  @ApiProperty({ description: 'SEO canonical URL', required: false, nullable: true })
  seoCanonical: string | null;

  @ApiProperty({ description: 'SEO robots directive', required: false, nullable: true })
  seoRobots: string | null;

  @ApiProperty({ description: 'Page type', default: 'page' })
  type: string;

  @ApiProperty({ description: 'Page sort order', default: 0 })
  sortOrder: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @ApiProperty({ description: 'Related pages in the same category' })
  pagesInCategory: RelatedPageDto[];
}
