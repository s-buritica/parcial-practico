import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AerolineaEntity } from '../aerolinea/aerolinea.entity';
import { AeropuertoEntity } from '../aeropuerto/aeropuerto.entity';
import { Repository } from 'typeorm';
import { BusinessLogicException, BusinessError } from '../shared/errors/business-errors';

@Injectable()
export class AerolineaAeropuertoService {
    constructor(
        @InjectRepository(AerolineaEntity)
        private readonly aerolineaRepository: Repository<AerolineaEntity>,
     
        @InjectRepository(AeropuertoEntity)
        private readonly aeropuertoRepository: Repository<AeropuertoEntity>
    ) {}

    async addAirportToAirline(aerolineaId: number, aeropuertoId: number): Promise<AerolineaEntity> {
        const aeropuerto: AeropuertoEntity = await this.aeropuertoRepository.findOne({where: {id: aeropuertoId}});
        if (!aeropuerto)
          throw new BusinessLogicException("El aeropuerto con el ID proporcionado no fue encontrado", BusinessError.NOT_FOUND);
       
        const aerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({where: {id: aerolineaId}, relations: ["aeropuertos"]});
        if (!aerolinea)
          throw new BusinessLogicException("La aerolínea con el ID proporcionado no fue encontrada", BusinessError.NOT_FOUND);
     
        const airportExists = aerolinea.aeropuertos.some((ap) => ap.id === aeropuerto.id);
        if (airportExists) {
            throw new BusinessLogicException("El aeropuerto ya está asociado a la aerolínea", BusinessError.PRECONDITION_FAILED);
        }

        aerolinea.aeropuertos = [...aerolinea.aeropuertos, aeropuerto];
        return await this.aerolineaRepository.save(aerolinea);
    }
     
    async findAirportsFromAirline(aerolineaId: number): Promise<AeropuertoEntity[]> {
        const aerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({where: {id: aerolineaId}, relations: ["aeropuertos"]});
        if (!aerolinea)
          throw new BusinessLogicException("La aerolínea con el ID proporcionado no fue encontrada", BusinessError.NOT_FOUND)
        
        return aerolinea.aeropuertos;
    }
     
    async findAirportFromAirline(aerolineaId: number, aeropuertoId: number): Promise<AeropuertoEntity> {
        const aeropuerto: AeropuertoEntity = await this.aeropuertoRepository.findOne({where: {id: aeropuertoId}});
        if (!aeropuerto)
          throw new BusinessLogicException("El aeropuerto con el ID proporcionado no fue encontrado", BusinessError.NOT_FOUND)
        
        const aerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({where: {id: aerolineaId}, relations: ["aeropuertos"]});
        if (!aerolinea)
          throw new BusinessLogicException("La aerolínea con el ID proporcionado no fue encontrada", BusinessError.NOT_FOUND)
    
        const aerolineaAeropuerto: AeropuertoEntity = aerolinea.aeropuertos.find(e => e.id === aeropuerto.id);
    
        if (!aerolineaAeropuerto)
          throw new BusinessLogicException("El aeropuerto con el ID proporcionado no está asociado a la aerolínea", BusinessError.PRECONDITION_FAILED)
    
        return aerolineaAeropuerto;
    }
     
    async updateAirportsFromAirline(aerolineaId: number, aeropuertos: AeropuertoEntity[]): Promise<AerolineaEntity> {
        const aerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({where: {id: aerolineaId}, relations: ["aeropuertos"]});
     
        if (!aerolinea)
          throw new BusinessLogicException("La aerolínea con el ID proporcionado no fue encontrada", BusinessError.NOT_FOUND)
     
        for (let i = 0; i < aeropuertos.length; i++) {
          const aeropuerto: AeropuertoEntity = await this.aeropuertoRepository.findOne({where: {id: aeropuertos[i].id}});
          if (!aeropuerto)
            throw new BusinessLogicException("El aeropuerto con el ID proporcionado no fue encontrado", BusinessError.NOT_FOUND)
        }
     
        aerolinea.aeropuertos = aeropuertos;
        return await this.aerolineaRepository.save(aerolinea);
    }
     
    async deleteAirportFromAirline(aerolineaId: number, aeropuertoId: number): Promise<void> {
        const aeropuerto: AeropuertoEntity = await this.aeropuertoRepository.findOne({where: {id: aeropuertoId}});
        if (!aeropuerto)
          throw new BusinessLogicException("El aeropuerto con el ID proporcionado no fue encontrado", BusinessError.NOT_FOUND);
     
        const aerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({where: {id: aerolineaId}, relations: ["aeropuertos"]});
        if (!aerolinea)
          throw new BusinessLogicException("La aerolínea con el ID proporcionado no fue encontrada", BusinessError.NOT_FOUND);
     
        const airportIndex: number = aerolinea.aeropuertos.findIndex(e => e.id === aeropuerto.id);
        if (airportIndex === -1)
            throw new BusinessLogicException("El aeropuerto con el ID proporcionado no está asociado a la aerolínea", BusinessError.PRECONDITION_FAILED);
 
        aerolinea.aeropuertos.splice(airportIndex, 1);
        await this.aerolineaRepository.save(aerolinea);
    }   
}
