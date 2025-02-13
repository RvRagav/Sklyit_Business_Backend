import { BadRequestException, Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import {Response} from 'express';
import { MailService } from './mailservice';
import { SklyitUsersService } from 'src/sklyit_users/sklyit_users.service';
@Controller('bs/auth')
export class AuthController {
    private resetCodes = new Map<string, string>();
    constructor(
        private authService: AuthService,
        private readonly mailService: MailService,
        private readonly usersService: SklyitUsersService,
    ) { }

    @Post('login')
    async login(
        @Body() body: { userid: string, password: string },
        @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.validateUser(body.userid, body.password);
        const {accessToken,refreshToken} =await this.authService.login(user);
        console.log(accessToken);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false, // Use secure cookies in production
            sameSite: 'none', // Prevent CSRF
            maxAge: 3600000, // 1 hour
        });
        res.cookie(
            'refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'none',
                maxAge: 30 * 24 * 60 * 60 * 1000
            }
        )
        return {token: accessToken,rtoken: refreshToken};
    }
    @Post('refresh')
    async refresh(@Body('refreshToken') refreshToken: string,
        @Res({ passthrough: true }) res: Response) {
        const { accessToken} = await this.authService.refreshAccessToken(refreshToken);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false, // Use secure cookies in production
            sameSite: 'none', // Prevent CSRF
            maxAge: 3600000, // 1 hour
        });
        return { token: accessToken };
    }
    @Get('logout')
    async logout(@Res({ passthrough: true }) res: Response,
        @Req() req) {
        await this.authService.logout(req.sub);
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return { message: 'Logout successful' };
    }

    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new BadRequestException('User not found');

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit code
        this.resetCodes.set(email, resetCode); // Store code temporarily

        await this.mailService.sendResetPasswordEmail(email, resetCode);
        return { message: 'Reset code sent to your email' };    
    }

    @Post('verify-reset-code')
    async verifyResetCode(@Body() { email, code }: { email: string; code: string }) {
        if (this.resetCodes.get(email) !== code) {
            throw new BadRequestException('Invalid reset code');
        }
        return { message: 'Code verified. You may now reset your password' };
    }

    @Post('reset-password')
    async resetPassword(@Body() { email, code, newPassword }: { email: string; code: string; newPassword: string }) {
        if (this.resetCodes.get(email) !== code) {
            throw new BadRequestException('Invalid reset code');
        }

        await this.usersService.updatePassword(email, newPassword);
        this.resetCodes.delete(email); // Remove used reset code
        return { message: 'Password updated successfully' };
    }
}
