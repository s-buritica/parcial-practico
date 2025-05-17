import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AerolineaEntity } from './aerolinea.entity';
import { BusinessLogicException, BusinessError } from '../shared/errors/business-errors';

@Injectable()
export class AerolineaService {
  constructor(
    @InjectRepository(AerolineaEntity)
    private readonly aerolineaRepository: Repository<AerolineaEntity>,
  ) {}

  private validateFechaFundacion(fechaFundacion: Date): void {
    const hoy = new Date();
    if (new Date(fechaFundacion) >= hoy) {
      throw new BusinessLogicException(
        'La fecha de fundación debe ser en el pasado.',
        BusinessError.PRECONDITION_FAILED,
      );
    }
  }

  async findAll(): Promise<AerolineaEntity[]> {
    return await this.aerolineaRepository.find({ relations: ['aeropuertos'] });
  }

  async findOne(id: number): Promise<AerolineaEntity> {
    const aerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({
      where: { id },
      relations: ['aeropuertos'],
    });
    if (!aerolinea)
      throw new BusinessLogicException(
        'La aerolínea con el ID proporcionado no fue encontrada',
        BusinessError.NOT_FOUND,
      );
    return aerolinea;
  }

  async create(aerolinea: AerolineaEntity): Promise<AerolineaEntity> {
    const existingAerolineaByName = await this.aerolineaRepository.findOne({ where: { nombre: aerolinea.nombre } });
    if (existingAerolineaByName) {
      throw new BusinessLogicException(
        `Ya existe una aerolínea con el nombre ${aerolinea.nombre}`,
        BusinessError.PRECONDITION_FAILED,
      );
    }
    this.validateFechaFundacion(aerolinea.fechaFundacion);
    return await this.aerolineaRepository.save(aerolinea);
  }

  async update(id: number, aerolinea: AerolineaEntity): Promise<AerolineaEntity> {
    const persistedAerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({ where: { id } });
    if (!persistedAerolinea)
      throw new BusinessLogicException(
        'La aerolínea con el ID proporcionado no fue encontrada',
        BusinessError.NOT_FOUND,
      );
    
    if (aerolinea.fechaFundacion) {
        this.validateFechaFundacion(aerolinea.fechaFundacion);
    }

    return await this.aerolineaRepository.save({ ...persistedAerolinea, ...aerolinea });
  }

  async delete(id: number): Promise<void> {
    const aerolinea: AerolineaEntity = await this.aerolineaRepository.findOne({ where: { id } });
    if (!aerolinea)
      throw new BusinessLogicException(
        'La aerolínea con el ID proporcionado no fue encontrada',
        BusinessError.NOT_FOUND,
      );
    await this.aerolineaRepository.remove(aerolinea);
  }
}
