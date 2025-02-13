import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get<string>('EMAIL_USER'),
                pass: this.configService.get<string>('EMAIL_PASS'),
            },
        });
    }

    async sendMail(options: nodemailer.SendMailOptions) {
        return this.transporter.sendMail(options);
    }

    async sendResetPasswordEmail(email: string, code: string) {
        const mailOptions: nodemailer.SendMailOptions = {
            from: this.configService.get<string>('EMAIL_USER'),
            to: email,
            subject: 'Password Reset Code',
            text: `Your password reset code is: ${code}`,
        };
        return this.sendMail(mailOptions);
    }
}
