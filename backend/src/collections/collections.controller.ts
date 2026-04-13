import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import {
  CreateCollectionDto,
  AddCollectionItemDto,
} from './dto/collections.dto';

/**
 * Collections Controller
 * Per 06_API_CONTRACTS.md §5
 */
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.collectionsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.collectionsService.findOne(req.user.userId, id);
  }

  @Post(':id/items')
  addItem(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: AddCollectionItemDto,
  ) {
    return this.collectionsService.addItem(req.user.userId, id, dto);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @Req() req: any,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.collectionsService.removeItem(req.user.userId, id, itemId);
  }

  @Delete(':id')
  deleteCollection(@Req() req: any, @Param('id') id: string) {
    return this.collectionsService.deleteCollection(req.user.userId, id);
  }
}
