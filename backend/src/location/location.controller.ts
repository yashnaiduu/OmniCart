import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { LocationService } from './location.service';
import { ValidateLocationDto, SaveLocationDto } from './dto/location.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
// We assume there's a JwtAuthGuard in src/auth, let's import the one likely used or create a generic requirement
// Usually it's in @nestjs/passport or auth module
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate if coordinates are within service area' })
  async validateLocation(@Body() dto: ValidateLocationDto) {
    return this.locationService.validateLocation(dto);
  }

  @Post('save')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save user location preferences' })
  async saveLocation(@Req() req: any, @Body() dto: SaveLocationDto) {
    const userId = req.user?.sub || req.user?.userId;
    return this.locationService.saveLocation(userId, dto);
  }
}
