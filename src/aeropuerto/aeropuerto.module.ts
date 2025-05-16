import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AeropuertoEntity } from './aeropuerto.entity';
import { AeropuertoService } from './aeropuerto.service';

@Module({
  imports: [TypeOrmModule.forFeature([AeropuertoEntity])],
  providers: [AeropuertoService],
})
export class AeropuertoModule {}
