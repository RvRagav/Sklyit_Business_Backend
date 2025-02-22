import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Repository } from 'typeorm';
import { Users } from './sklyit_users.entity';
import { CreateUserDto, UpdateUserDto } from './sklyit_users.dto';
import { AzureBlobService } from 'src/imageBlob/imageBlob.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SklyitUsersService {
    private readonly containerName: string;

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Users)
        private readonly userRepository: Repository<Users>,
        private azureBlobService: AzureBlobService
    ) {
        this.containerName = this.configService.get<string>('AZURE_STORAGE_CONTAINER_NAME');
    }


    async registerUser(createUserDto: CreateUserDto, file?: Express.Multer.File): Promise<Users> {
        const { gmail, mobileno, usertype } = createUserDto;
        
        // Check if user already exists
        const existingUser = await this.userRepository.findOne({
            where: [{ gmail,usertype:usertype }, { mobileno,usertype:usertype }],
        });
        if (existingUser) {
            throw new ConflictException(
                'User with this email or mobile number already exists',
            );
        }
// If a file is provided, upload it to Azure Blob Storage
        if (file) {
            try {
                const imageUrl = await this.azureBlobService.upload(file, this.containerName);
                createUserDto.imgurl = imageUrl; // Add image URL to DTO
            } catch (error) {
                console.error('Error uploading image:', error);
                throw new Error('Failed to upload image');
            }
        }
        createUserDto.password = bcrypt.hashSync(createUserDto.password, 10); // Hash the password
        // Save the new user
        const user = this.userRepository.create({
            ...createUserDto,
            // Associate valid premiumId or set as null
        });
        return await this.userRepository.save(user);
    }
    async getAllUsers(): Promise<Users[]> {
        return await this.userRepository.find();
    }

    async getUserById(id: string): Promise<Users> {
        const user = await this.userRepository.findOne({ where: { userId: id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async updatePassword(id: string, newPassword: string): Promise<Users> {
        const user = await this.userRepository.findOne({ where: { userId: id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.password = bcrypt.hashSync(newPassword, 10); // Hash the newPassword;
        return await this.userRepository.save(user);
    }
    
    async validateUser( userid: string,password: string): Promise<Users> {
        const user = await this.userRepository.findOne({ where: [{ wtappNo:userid },{  mobileno:userid },{gmail:userid}] });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if(user && bcrypt.compareSync(password,user.password)){
            return user;
        }
        return user;
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto,file?: Express.Multer.File): Promise<Users> {
        const user = await this.userRepository.findOne({ where: { userId: id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        
        if (file) {
            try {
                const imageUrl = await this.azureBlobService.upload(file, this.containerName);
                updateUserDto.imgurl = imageUrl; // Add image URL to DTO
            } catch (error) {
                console.error('Error uploading image:', error);
                throw new Error('Failed to upload image');
            }
        }
        //console.log(updateUserDto);
        return await this.userRepository.save({ ...user, ...updateUserDto });
    }

    async update_fcm_token(userId: string, fcm_token: string) {
        const user = await this.userRepository.findOne({ where: { userId: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.fcm_token = fcm_token;
        return this.userRepository.save(user);
    }

    async getNameById(userid: string): Promise<{name: string}> {
        const user = await this.userRepository.findOne({ where: { userId: userid } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return {name: user.name};
    }

    async findByEmail(email: string): Promise<Users> {
        const user = await this.userRepository.findOne({ where: { gmail: email } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
}