import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BsservicesService } from './bsservices.service';
import { Services } from './services.entity';
import { CreateServiceDto } from './dto/createServiceDto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('bs/:business_id/')
export class BsservicesController {
    constructor(private readonly bsservicesService: BsservicesService) { }

    @Get('hello')
    getHello(): string {
        return this.bsservicesService.getHello();
    }

    @Get('services')
    getServices(@Param('business_id') bs_id: string): Promise<Services[]> {
        return this.bsservicesService.getServices(bs_id);
    }

    @Get('services/:service_id')
    getServiceById(@Param('business_id') bs_id: string, @Param('service_id') service_id: string): Promise<Services> {
        return this.bsservicesService.getServiceById(bs_id, service_id);
    }

    @Get('service')
    getServicesByFlag(
        @Param('business_id') bs_id: string,
    ): Promise<Services[]> {
        return this.bsservicesService.getServicesByFlag(bs_id);
    }

    @Get('service/:service_id')
    getServiceByFlag(
        @Param('business_id') bs_id: string,
        @Param('service_id') service_id:string,
    ): Promise<Services>{
        return this.bsservicesService.getServiceByFlag(bs_id, service_id);
    }
    
    @Post('services')
    @UseInterceptors(
        FileInterceptor('image', {
            fileFilter: (req, file, callback) => {
                const isAllowed = ['image/jpeg', 'image/png', 'image/jpg'].some(mime => mime === file.mimetype);
                callback(isAllowed ? null : new BadRequestException('Only jpeg, png, and jpg files are allowed'), isAllowed);
            },
        }),
    )
    createServices(
        @Param('business_id') bs_id: string,
        @Body() createServicesDto: CreateServiceDto,
        @UploadedFile() file: Express.Multer.File
    ): Promise<Services> {
        return this.bsservicesService.createServices(bs_id, createServicesDto, file);
    }

    @Put('services/:service_id')
    updateServices(
        @Param('business_id') bs_id: string,
        @Param('service_id') service_id: string,
        @Body() updateServicesDto: CreateServiceDto
    ): Promise<Services> {
        return this.bsservicesService.updateServices(bs_id, service_id, updateServicesDto);
    }

    @Put('service/:service_id')
    updateFlag(
        @Param('business_id') bs_id: string,
        @Param('service_id') service_id: string
    ): Promise<Services> {
        return this.bsservicesService.updateServiceFlag(bs_id, service_id);
    }    
        
    @Delete('services/:service_id')
    deleteServices(@Param('business_id') bs_id: string, @Param('service_id') service_id: string): Promise<void> {
        return this.bsservicesService.deleteServices(bs_id, service_id);
    }
}

