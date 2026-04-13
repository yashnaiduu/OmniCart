import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AiEngineService } from '../ai-engine/ai-engine.service';
import {
  CreateCollectionDto,
  AddCollectionItemDto,
} from './dto/collections.dto';

/**
 * Collections Service
 * CRUD operations for user grocery collections
 * Per 06_API_CONTRACTS.md §5
 */
@Injectable()
export class CollectionsService {
  private readonly logger = new Logger(CollectionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiEngine: AiEngineService,
  ) {}

  async create(userId: string, dto: CreateCollectionDto) {
    this.logger.log(`Creating collection "${dto.name}" for user ${userId}`);

    return this.prisma.collection.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        frequency: dto.frequency,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.collection.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, collectionId: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { id: collectionId, userId },
      include: { items: true },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  async addItem(
    userId: string,
    collectionId: string,
    dto: AddCollectionItemDto,
  ) {
    // Verify collection belongs to user
    const collection = await this.prisma.collection.findFirst({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    // Normalize the item name using AI Engine
    const normalizedName = this.aiEngine.normalize(dto.name);

    return this.prisma.collectionItem.create({
      data: {
        collectionId,
        name: dto.name,
        quantity: dto.quantity,
        normalizedName,
      },
    });
  }

  async removeItem(userId: string, collectionId: string, itemId: string) {
    // Verify collection belongs to user
    const collection = await this.prisma.collection.findFirst({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    const item = await this.prisma.collectionItem.findFirst({
      where: { id: itemId, collectionId },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return this.prisma.collectionItem.delete({
      where: { id: itemId },
    });
  }

  async deleteCollection(userId: string, collectionId: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    // Delete all items first, then the collection
    await this.prisma.collectionItem.deleteMany({
      where: { collectionId },
    });

    return this.prisma.collection.delete({
      where: { id: collectionId },
    });
  }
}
