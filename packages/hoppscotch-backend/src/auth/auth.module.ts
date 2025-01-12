import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RTJwtStrategy } from './strategies/rt-jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { OidcStrategy } from './strategies/oidc.strategy';
import { AuthProvider, authProviderCheck } from './helper';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    RTJwtStrategy,
    ...(authProviderCheck(AuthProvider.GOOGLE) ? [GoogleStrategy] : []),
    ...(authProviderCheck(AuthProvider.GITHUB) ? [GithubStrategy] : []),
    ...(authProviderCheck(AuthProvider.MICROSOFT) ? [MicrosoftStrategy] : []),
  ],
  controllers: [AuthController],
})
export class AuthModule {
  static async register() {
    const isInfraConfigPopulated = await isInfraConfigTablePopulated();
    if (!isInfraConfigPopulated) {
      return { module: AuthModule };
    }

    const env = await loadInfraConfiguration();
    const allowedAuthProviders = env.INFRA.VITE_ALLOWED_AUTH_PROVIDERS;

    const providers = [
      ...(authProviderCheck(AuthProvider.GOOGLE, allowedAuthProviders)
        ? [GoogleStrategy]
        : []),
      ...(authProviderCheck(AuthProvider.GITHUB, allowedAuthProviders)
        ? [GithubStrategy]
        : []),
      ...(authProviderCheck(AuthProvider.MICROSOFT, allowedAuthProviders)
        ? [MicrosoftStrategy]
        : []),
    ];

    return {
      module: AuthModule,
      providers,
    };
  }
}
