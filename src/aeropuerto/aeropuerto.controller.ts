import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { AeropuertoService } from './aeropuerto.service';
import { AeropuertoDto, AeropuertoUpdateDto } from './aeropuerto.dto';
import { AeropuertoEntity } from './aeropuerto.entity';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors/business-errors.interceptor';
import { plainToInstance } from 'class-transformer';

@Controller('airports')
@UseInterceptors(BusinessErrorsInterceptor)
export class AeropuertoController {
  constructor(private readonly aeropuertoService: AeropuertoService) {}

  @Get()
  async findAll(): Promise<AeropuertoEntity[]> {
    return await this.aeropuertoService.findAll();
  }

  @Get(':aeropuertoId')
  async findOne(@Param('aeropuertoId') aeropuertoId: number): Promise<AeropuertoEntity> {
    return await this.aeropuertoService.findOne(aeropuertoId);
  }

  @Post()
  async create(@Body() aeropuertoDto: AeropuertoDto): Promise<AeropuertoEntity> {
    const aeropuerto: AeropuertoEntity = plainToInstance(AeropuertoEntity, aeropuertoDto);
    return await this.aeropuertoService.create(aeropuerto);
  }

  @Put(':aeropuertoId')
  async update(
    @Param('aeropuertoId') aeropuertoId: number,
    @Body() aeropuertoDto: AeropuertoUpdateDto,
  ): Promise<AeropuertoEntity> {
    const aeropuerto: AeropuertoEntity = plainToInstance(AeropuertoEntity, aeropuertoDto);
    return await this.aeropuertoService.update(aeropuertoId, aeropuerto);
  }

  @Delete(':aeropuertoId')
  @HttpCode(204)
  async delete(@Param('aeropuertoId') aeropuertoId: number): Promise<void> {
    await this.aeropuertoService.delete(aeropuertoId);
  }
}
