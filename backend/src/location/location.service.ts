import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SaveLocationDto, ValidateLocationDto } from './dto/location.dto';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Validate if a given location is within supported service areas.
   * For MVP, we simply accept it, but in production, this would do a geospatial query
   * or a geofence check.
   */
  async validateLocation(dto: ValidateLocationDto) {
    if (!dto.latitude || !dto.longitude) {
      throw new BadRequestException('Invalid coordinates provided.');
    }

    // Dummy validation logic: if lat/lon is outside India bounds as a simple check
    if (
      dto.latitude < 6 ||
      dto.latitude > 36 ||
      dto.longitude < 68 ||
      dto.longitude > 98
    ) {
      return {
        serviceAvailable: false,
        message: 'Location is currently outside our service area.',
      };
    }

    return {
      serviceAvailable: true,
      message: 'Service is available in this location.',
    };
  }

  /**
   * Save the location against the user profile.
   */
  async saveLocation(userId: string, dto: SaveLocationDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        city: dto.city,
        accuracy: dto.accuracy,
        lastLocationUpdate: new Date(),
      },
    });

    return {
      success: true,
      city: user.city,
      lastUpdated: user.lastLocationUpdate,
    };
  }
}
