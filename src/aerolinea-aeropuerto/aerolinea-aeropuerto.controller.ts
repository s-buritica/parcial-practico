// src/aerolinea-aeropuerto/aerolinea-aeropuerto.controller.ts
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { AerolineaAeropuertoService } from './aerolinea-aeropuerto.service';
import { AeropuertoEntity } from '../aeropuerto/aeropuerto.entity';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors/business-errors.interceptor';
import { AeropuertoDto } from '../aeropuerto/aeropuerto.dto'; // Usado para el body de update
import { plainToInstance } from 'class-transformer';

@Controller('airlines')
@UseInterceptors(BusinessErrorsInterceptor)
export class AerolineaAeropuertoController {
    constructor(private readonly aerolineaAeropuertoService: AerolineaAeropuertoService){}

    @Post(':aerolineaId/airports/:aeropuertoId')
    async addAirportToAirline(@Param('aerolineaId') aerolineaId: number, @Param('aeropuertoId') aeropuertoId: number){
        return await this.aerolineaAeropuertoService.addAirportToAirline(aerolineaId, aeropuertoId);
    }

    @Get(':aerolineaId/airports')
    async findAirportsFromAirline(@Param('aerolineaId') aerolineaId: number){
        return await this.aerolineaAeropuertoService.findAirportsFromAirline(aerolineaId);
    }

    @Get(':aerolineaId/airports/:aeropuertoId')
    async findAirportFromAirline(@Param('aerolineaId') aerolineaId: number, @Param('aeropuertoId') aeropuertoId: number){
        return await this.aerolineaAeropuertoService.findAirportFromAirline(aerolineaId, aeropuertoId);
    }

    @Put(':aerolineaId/airports')
    async updateAirportsFromAirline(@Param('aerolineaId') aerolineaId: number, @Body() aeropuertosDto: AeropuertoDto[]){
        const aeropuertos: AeropuertoEntity[] = plainToInstance(AeropuertoEntity, aeropuertosDto);
        return await this.aerolineaAeropuertoService.updateAirportsFromAirline(aerolineaId, aeropuertos);
    }

    @Delete(':aerolineaId/airports/:aeropuertoId')
    @HttpCode(204)
    async deleteAirportFromAirline(@Param('aerolineaId') aerolineaId: number, @Param('aeropuertoId') aeropuertoId: number){
        return await this.aerolineaAeropuertoService.deleteAirportFromAirline(aerolineaId, aeropuertoId);
    }
}
