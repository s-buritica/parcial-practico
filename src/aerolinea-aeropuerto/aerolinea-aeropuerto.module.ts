import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AerolineaEntity } from '../aerolinea/aerolinea.entity';
import { AeropuertoEntity } from '../aeropuerto/aeropuerto.entity';
import { AerolineaAeropuertoService } from './aerolinea-aeropuerto.service';

@Module({
  imports: [TypeOrmModule.forFeature([AerolineaEntity, AeropuertoEntity])],
  providers: [AerolineaAeropuertoService],
})
export class AerolineaAeropuertoModule {}
