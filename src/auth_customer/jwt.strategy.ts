import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'customer-jwt') {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => {
                    // Check for JWT in cookies
                    const tokenFromCookies = req?.cookies?.accessToken;
                    if (tokenFromCookies) {
                        return tokenFromCookies;
                    }

                    // Check for JWT in Authorization header
                    const authHeader = req?.headers?.authorization;
                    if (authHeader && authHeader.startsWith('Bearer ')) {
                        return authHeader.split(' ')[1];
                    }

                    // Return null if no token is found
                    return null;
                },
            ]),
            secretOrKey: configService.get<string>('SECRET_KEY', 'secretKey'), // Use the environment variable if available
        });
    }

    async validate(payload: any) {
        return { userid: payload.sub };
    }
}
