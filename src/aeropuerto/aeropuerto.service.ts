import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AeropuertoEntity } from './aeropuerto.entity';
import { BusinessLogicException, BusinessError } from '../shared/errors/business-errors';

@Injectable()
export class AeropuertoService {
  constructor(
    @InjectRepository(AeropuertoEntity)
    private readonly aeropuertoRepository: Repository<AeropuertoEntity>,
  ) {}

  private validateCodigoAeropuerto(codigo: string): void {
    if (codigo && codigo.length !== 3) {
      throw new BusinessLogicException(
        'El código del aeropuerto debe tener exactamente 3 caracteres.',
        BusinessError.PRECONDITION_FAILED,
      );
    }
  }

  async findAll(): Promise<AeropuertoEntity[]> {
    return await this.aeropuertoRepository.find({ relations: ['aerolineas'] });
  }

  async findOne(id: number): Promise<AeropuertoEntity> {
    const aeropuerto: AeropuertoEntity = await this.aeropuertoRepository.findOne({
      where: { id },
      relations: ['aerolineas'],
    });
    if (!aeropuerto)
      throw new BusinessLogicException(
        'El aeropuerto con el ID proporcionado no fue encontrado',
        BusinessError.NOT_FOUND,
      );
    return aeropuerto;
  }

  async create(aeropuerto: AeropuertoEntity): Promise<AeropuertoEntity> {
    this.validateCodigoAeropuerto(aeropuerto.codigo);
    return await this.aeropuertoRepository.save(aeropuerto);
  }

  async update(id: number, aeropuerto: AeropuertoEntity): Promise<AeropuertoEntity> {
    const persistedAeropuerto: AeropuertoEntity = await this.aeropuertoRepository.findOne({ where: { id } });
    if (!persistedAeropuerto)
      throw new BusinessLogicException(
        'El aeropuerto con el ID proporcionado no fue encontrado',
        BusinessError.NOT_FOUND,
      );
    
    if (aeropuerto.codigo) {
        this.validateCodigoAeropuerto(aeropuerto.codigo);
    }
    
    return await this.aeropuertoRepository.save({ ...persistedAeropuerto, ...aeropuerto });
  }

  async delete(id: number): Promise<void> {
    const aeropuerto: AeropuertoEntity = await this.aeropuertoRepository.findOne({ where: { id } });
    if (!aeropuerto)
      throw new BusinessLogicException(
        'El aeropuerto con el ID proporcionado no fue encontrado',
        BusinessError.NOT_FOUND,
      );
    await this.aeropuertoRepository.remove(aeropuerto);
  }
}
