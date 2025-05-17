import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { AerolineaService } from './aerolinea.service';
import { AerolineaDto, AerolineaUpdateDto } from './aerolinea.dto';
import { AerolineaEntity } from './aerolinea.entity';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors/business-errors.interceptor';
import { plainToInstance } from 'class-transformer';

@Controller('airlines')
@UseInterceptors(BusinessErrorsInterceptor)
export class AerolineaController {
  constructor(private readonly aerolineaService: AerolineaService) {}

  @Get()
  async findAll(): Promise<AerolineaEntity[]> {
    return await this.aerolineaService.findAll();
  }

  @Get(':aerolineaId')
  async findOne(@Param('aerolineaId') aerolineaId: number): Promise<AerolineaEntity> {
    return await this.aerolineaService.findOne(aerolineaId);
  }

  @Post()
  async create(@Body() aerolineaDto: AerolineaDto): Promise<AerolineaEntity> {
    const aerolinea: AerolineaEntity = plainToInstance(AerolineaEntity, aerolineaDto);
    return await this.aerolineaService.create(aerolinea);
  }

  @Put(':aerolineaId')
  async update(
    @Param('aerolineaId') aerolineaId: number,
    @Body() aerolineaDto: AerolineaUpdateDto,
  ): Promise<AerolineaEntity> {
    const aerolinea: AerolineaEntity = plainToInstance(AerolineaEntity, aerolineaDto);
    return await this.aerolineaService.update(aerolineaId, aerolinea);
  }

  @Delete(':aerolineaId')
  @HttpCode(204)
  async delete(@Param('aerolineaId') aerolineaId: number): Promise<void> {
    await this.aerolineaService.delete(aerolineaId);
  }
}
