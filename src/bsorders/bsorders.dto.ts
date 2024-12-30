
import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateOrdersDto {
    @IsString()
    custid: string;
    
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ServiceDto)
    services: ServiceDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductDto)
    products: ProductDto[];
}

export class UpdateOrdersDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ServiceDto)
    services: ServiceDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductDto)
    products: ProductDto[];
}


class ServiceDto {
    @IsString()
    serviceName: string;

    @IsNumber()
    cost: number;
}

class ProductDto {
    @IsString()
    productName: string;

    @IsNumber()
    cost: number;
}