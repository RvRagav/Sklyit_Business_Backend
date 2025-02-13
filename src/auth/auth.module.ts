import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtBusStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SklyitUsersModule } from 'src/sklyit_users/sklyit_users.module';
import { BusinessClients } from 'src/business_clients/business_clients.entity';
import { BusinessClientsModule } from 'src/business_clients/business_clients.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './refreshtoken.entity';
import { MailService } from './mailservice';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('SECRET_KEY'),
        signOptions: {  },
      })
    }),
    SklyitUsersModule,BusinessClientsModule,TypeOrmModule.forFeature([BusinessClients,RefreshToken])
  ],
  providers: [AuthService, JwtBusStrategy,MailService],
  controllers: [AuthController],
  exports:[AuthService,MailService]
})
export class AuthModule {}
