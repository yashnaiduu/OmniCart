import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';
import { LoginDto, SignupDto, ForgotPasswordDto } from './dto/auth.dto';

/**
 * Auth Service
 * Handles JWT-based authentication per 13_SECURITY_SPEC.md
 * - Access token: 15min
 * - Refresh token: 7 days
 * - Password hashing: bcrypt (10 rounds)
 * - Stateful Sessions via UserSession table
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(dto: SignupDto, ip?: string, userAgent?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
      },
    });

    this.logger.log(`User registered: ${user.id}`);

    return this.generateTokens(user.id, user.email, ip, userAgent);
  }

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('INVALID_CREDENTIALS');
    }

    this.logger.log(`User logged in: ${user.id}`);

    return this.generateTokens(user.id, user.email, ip, userAgent);
  }

  async refresh(refreshToken: string, ip?: string, userAgent?: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      // Validate against database
      const session = await this.prisma.userSession.findUnique({
        where: { refreshToken },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Session expired or invalid');
      }

      // Rotate token: Destroy old session, create new tokens
      await this.prisma.userSession.delete({
        where: { id: session.id },
      });

      return this.generateTokens(payload.sub, payload.email, ip, userAgent);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      await this.prisma.userSession.delete({
        where: { refreshToken },
      });
      this.logger.log('User session securely revoked.');
    } catch {
      // Ignore if session already deleted or invalid token passed
    }
    return { success: true, message: 'Logged out successfully' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (user) {
      // Generate secure reset token
      const resetToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        { expiresIn: '1h' },
      );
      // Simulating email send
      this.logger.warn(`[SIMULATED EMAIL] Password reset token for ${dto.email}: ${resetToken}`);
    } else {
      this.logger.warn(`Password reset requested for unregistered email: ${dto.email}`);
    }

    // Always return success to prevent email enumeration attacks
    return { success: true, message: 'If the email exists, a reset link has been sent.' };
  }

  private async generateTokens(userId: string, email: string, ip?: string, userAgent?: string) {
    const payload = { sub: userId, email, role: 'user' };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: (this.configService.get<string>('jwt.expiresIn') || '15m') as any,
    });

    const expiresInString = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: expiresInString as any,
    });

    // Calculate approx expiration date based on string (default 7 days)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7);

    await this.prisma.userSession.create({
      data: {
        userId,
        refreshToken,
        ip,
        device: userAgent,
        expiresAt: expirationDate,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900, // 15 min in seconds
    };
  }
}
