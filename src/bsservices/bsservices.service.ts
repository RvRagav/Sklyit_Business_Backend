import { Injectable } from '@nestjs/common';
import { Services } from './services.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateServiceDto, UpdateServiceDto } from './dto/createServiceDto';
import { AzureBlobService } from 'src/imageBlob/imageBlob.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BsservicesService {

    private readonly containerName: string;

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Services)
        private readonly serviceRepository: Repository<Services>,
        private azureBlobService: AzureBlobService

    ) {
        this.containerName = this.configService.get<string>('CONTAINER_NAME') || 'biz';
    }

    
    getHello(): string {
        return 'Hello World!';
    }

    async getServices(bs_id: string): Promise<Services[]> {
        if (!bs_id) {
            throw new Error('Business ID is required');
        }
        try {
            return await this.serviceRepository.find({
                where: { businessClient: { BusinessId: bs_id } },
                relations: ['businessClient'], // Ensure the relation is loaded
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getServiceById(bs_id: string, service_id: string): Promise<Services> {
        if (!bs_id || !service_id) {
            throw new Error('Business ID and Service ID are required');
        }
        try {
            return await this.serviceRepository.findOne({
                where: { businessClient: { BusinessId: bs_id }, Sid: service_id },
                relations: ['businessClient'], // Ensure the relation is loaded
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getServicesByFlag(
        bs_id:string
    ): Promise<Services[]>{
        if (!bs_id) {
            throw new Error("Business id is required")
        }
        try {
            return await this.serviceRepository.find({
                where: { businessClient: { BusinessId: bs_id } ,Sflag:0},
                relations: ['businessClient'], // Ensure the relation is loaded
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getServiceByFlag(bs_id: string, service_id: string): Promise<Services>{
        if (!bs_id || !service_id) {
            throw new Error('Business ID and Service ID are required');
        }
        try {
            return await this.serviceRepository.findOne({
                where: { businessClient: { BusinessId: bs_id }, Sid: service_id },
                relations: ['businessClient'], // Ensure the relation is loaded
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async createServices(bs_id: string, createServicesDto: CreateServiceDto, file?: Express.Multer.File): Promise<Services> {
        if (!bs_id) {
            throw new Error('Business ID is required');
        }

        const { name, description, price } = createServicesDto;
        let imageUrl = '';
        if(file){
            imageUrl = await this.azureBlobService.upload(file, this.containerName)

        }
        if (!name || !price) {
            throw new Error('Name and Price are required fields');
        }

        const service = this.serviceRepository.create({
            ServiceName: name,
            ServiceDesc: description || '',
            ServiceCost: price,
            ImageUrl:imageUrl||'',
            businessClient: { BusinessId: bs_id }
        });

        try {
            return await this.serviceRepository.save(service);

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updateServices(bs_id: string, service_id: string, updateServicesDto: UpdateServiceDto, file?: Express.Multer.File): Promise<Services> {
        if (!bs_id || !service_id) {
            throw new Error('Business ID and Service ID are required');
        }

        const { name, description, price, imageUrl } = updateServicesDto;

        // ✅ Ensure that businessClient relation is loaded
        const service = await this.serviceRepository.findOne({
            where: { Sid: service_id, businessClient: { BusinessId: bs_id } },
            relations: ['businessClient'], // Load the related BusinessClients entity
        });

        // ✅ Check if service exists
        if (!service) {
            throw new Error('Service not found');
        }

        // ✅ Check if the service actually belongs to the provided bs_id
        if (!service.businessClient || service.businessClient.BusinessId !== bs_id) {
            console.log(service.businessClient);
            throw new Error('BusinessClient not found hi');
        }

        // ✅ Handle image upload
        if (file) {
            const uploadedImageUrl = await this.azureBlobService.upload(file, this.containerName);
            service.ImageUrl = uploadedImageUrl;
        } else if (imageUrl) {
            service.ImageUrl = imageUrl;
        }

        // ✅ Update other fields
        service.ServiceName = name || service.ServiceName;
        service.ServiceDesc = description || service.ServiceDesc;
        service.ServiceCost = price || service.ServiceCost;

        try {
            return await this.serviceRepository.save(service);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updateServiceFlag(
        bs_id: string,
        service_id: string
    ):Promise<Services> {
        if (!bs_id || !service_id) {
            throw new Error('Business ID and Service ID are required');
        }
        const service = await this.serviceRepository.findOne({
            where: { businessClient: { BusinessId: bs_id }, Sid: service_id },
            relations: ['businessClient'], // Ensure the relation is loaded
        });
        if (!service) {
            throw new Error('Service not found');
        }
        service.Sflag = 1;
        try {
            return await this.serviceRepository.save(service);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async deleteServices(bs_id: string, service_id: string): Promise<void> {
        if (!bs_id || !service_id) {
            throw new Error('Business ID and Service ID are required');
        }
        const service = await this.serviceRepository.findOne({
            where: { businessClient: { BusinessId: bs_id }, Sid: service_id },
            relations: ['businessClient'], // Ensure the relation is loaded
        });
        if (!service) {
            throw new Error('Service not found');
        }
        try {
            await this.serviceRepository.remove(service);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
