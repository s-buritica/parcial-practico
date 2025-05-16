import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AeropuertoEntity } from './aeropuerto.entity';
import { AeropuertoService } from './aeropuerto.service';
import { faker } from '@faker-js/faker';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

describe('AeropuertoService', () => {
  let service: AeropuertoService;
  let repository: Repository<AeropuertoEntity>;
  let aeropuertosList: AeropuertoEntity[];

  const seedDatabase = async () => {
    repository.clear();
    aeropuertosList = [];
    for (let i = 0; i < 5; i++) {
      const aeropuerto: AeropuertoEntity = await repository.save({
        nombre: faker.company.name() + " Airport",
        codigo: faker.string.alpha({ length: 3, casing: 'upper' }),
        pais: faker.location.country(),
        ciudad: faker.location.city(),
        aerolineas: []
      });
      aeropuertosList.push(aeropuerto);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AeropuertoService],
    }).compile();

    service = module.get<AeropuertoService>(AeropuertoService);
    repository = module.get<Repository<AeropuertoEntity>>(
      getRepositoryToken(AeropuertoEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all airports', async () => {
    const result: AeropuertoEntity[] = await service.findAll();
    expect(result).not.toBeNull();
    expect(result.length).toEqual(aeropuertosList.length);
  });

  it('findOne should return an airport by id', async () => {
    const storedAeropuerto: AeropuertoEntity = aeropuertosList[0];
    const aeropuerto: AeropuertoEntity = await service.findOne(storedAeropuerto.id);
    expect(aeropuerto).not.toBeNull();
    expect(aeropuerto.nombre).toEqual(storedAeropuerto.nombre);
    expect(aeropuerto.codigo).toEqual(storedAeropuerto.codigo);
    expect(aeropuerto.pais).toEqual(storedAeropuerto.pais);
    expect(aeropuerto.ciudad).toEqual(storedAeropuerto.ciudad);
    expect(aeropuerto.aerolineas).toEqual(storedAeropuerto.aerolineas);
  });

  it('findOne should throw an exception for an invalid airport id', async () => {
    await expect(() => service.findOne(faker.number.int()))
        .rejects.toMatchObject(new BusinessLogicException('El aeropuerto con el ID proporcionado no fue encontrado', BusinessError.NOT_FOUND));
  });

  it('create should return a new airport', async () => {
    const aeropuertoData: AeropuertoEntity = {
      id: 0,
      nombre: faker.company.name() + " Airport",
      codigo: faker.string.alpha({ length: 3, casing: 'upper' }),
      pais: faker.location.country(),
      ciudad: faker.location.city(),
      aerolineas: []
    };

    const newAeropuerto: AeropuertoEntity = await service.create(aeropuertoData);
    expect(newAeropuerto).not.toBeNull();

    const storedAeropuerto: AeropuertoEntity = await repository.findOne({
      where: { id: newAeropuerto.id },
    });
    expect(storedAeropuerto).not.toBeNull();
    expect(storedAeropuerto.codigo).toEqual(aeropuertoData.codigo);
  });

  it('create should throw an exception if airport code is not 3 characters long', async () => {
    const aeropuertoData: AeropuertoEntity = {
      id: 0,
      nombre: faker.company.name() + " Airport",
      codigo: 'ABCD',
      pais: faker.location.country(),
      ciudad: faker.location.city(),
      aerolineas: []
    };
    await expect(() => service.create(aeropuertoData))
        .rejects.toMatchObject(new BusinessLogicException('El código del aeropuerto debe tener exactamente 3 caracteres.', BusinessError.PRECONDITION_FAILED));
  });

  it('update should modify an airport', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    aeropuerto.nombre = 'Nuevo Aeropuerto';
    aeropuerto.codigo = 'NVO';

    const updatedAeropuerto: AeropuertoEntity = await service.update(
      aeropuerto.id,
      aeropuerto,
    );
    expect(updatedAeropuerto).not.toBeNull();

    const storedAeropuerto: AeropuertoEntity = await repository.findOne({
      where: { id: aeropuerto.id },
    });
    expect(storedAeropuerto).not.toBeNull();
    expect(storedAeropuerto.nombre).toEqual('Nuevo Aeropuerto');
    expect(storedAeropuerto.codigo).toEqual('NVO');
  });

  it('update should throw an exception if airport code is not 3 characters long', async () => {
    const aeropuertoToUpdate: AeropuertoEntity = aeropuertosList[0];
    const updatedData = { ...aeropuertoToUpdate, codigo: 'INVALID' };

    await expect(() => service.update(aeropuertoToUpdate.id, updatedData))
        .rejects.toMatchObject(new BusinessLogicException('El código del aeropuerto debe tener exactamente 3 caracteres.', BusinessError.PRECONDITION_FAILED));
  });

  it('update should throw an exception for an invalid airport id', async () => {
    let aeropuerto: AeropuertoEntity = aeropuertosList[0];
    aeropuerto = { ...aeropuerto, nombre: 'Nuevo Aeropuerto' };
    await expect(() => service.update(faker.number.int(), aeropuerto))
        .rejects.toMatchObject(new BusinessLogicException('El aeropuerto con el ID proporcionado no fue encontrado', BusinessError.NOT_FOUND));
  });

  it('delete should remove an airport', async () => {
    const aeropuerto: AeropuertoEntity = aeropuertosList[0];
    await service.delete(aeropuerto.id);

    const deletedAeropuerto: AeropuertoEntity = await repository.findOne({
      where: { id: aeropuerto.id },
    });
    expect(deletedAeropuerto).toBeNull();
  });

  it('delete should throw an exception for an invalid airport id', async () => {
     await expect(() => service.delete(faker.number.int()))
        .rejects.toMatchObject(new BusinessLogicException('El aeropuerto con el ID proporcionado no fue encontrado', BusinessError.NOT_FOUND));
  });
});
