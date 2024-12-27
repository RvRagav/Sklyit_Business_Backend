import { Module } from '@nestjs/common';
import { BsservicesController } from './bsservices.controller';
import { BsservicesService } from './bsservices.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Services } from './services.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Services])],
  controllers: [BsservicesController],
  providers: [BsservicesService],
  exports: [BsservicesService],
})
export class BsservicesModule {}