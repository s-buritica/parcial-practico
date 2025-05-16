import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AerolineaModule } from './aerolinea/aerolinea.module';
import { AeropuertoModule } from './aeropuerto/aeropuerto.module';
import { AerolineaEntity } from './aerolinea/aerolinea.entity';
import { AeropuertoEntity } from './aeropuerto/aeropuerto.entity';
import { AerolineaAeropuertoModule } from './aerolinea-aeropuerto/aerolinea-aeropuerto.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'aerolineas_db',
      entities: [AerolineaEntity, AeropuertoEntity],
      synchronize: true,
    }),
    AerolineaModule,
    AeropuertoModule,
    AerolineaAeropuertoModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,
  ],
})
export class AppModule {}
