import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AerolineaEntity } from './aerolinea.entity';
import { AerolineaService } from './aerolinea.service';
import { faker } from '@faker-js/faker';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

describe('AerolineaService', () => {
  let service: AerolineaService;
  let repository: Repository<AerolineaEntity>;
  let aerolineasList: AerolineaEntity[];

  const seedDatabase = async () => {
    repository.clear();
    aerolineasList = [];
    for (let i = 0; i < 5; i++) {
      const aerolinea: AerolineaEntity = await repository.save({
        nombre: faker.company.name(),
        descripcion: faker.lorem.sentence(),
        fechaFundacion: faker.date.past(),
        paginaWeb: faker.internet.url(),
        aeropuertos: []
      });
      aerolineasList.push(aerolinea);
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AerolineaService],
    }).compile();

    service = module.get<AerolineaService>(AerolineaService);
    repository = module.get<Repository<AerolineaEntity>>(
      getRepositoryToken(AerolineaEntity),
    );
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all airlines', async () => {
    const result: AerolineaEntity[] = await service.findAll();
    expect(result).not.toBeNull();
    expect(result.length).toEqual(aerolineasList.length);
  });

  it('findOne should return an airline by id', async () => {
    const storedAerolinea: AerolineaEntity = aerolineasList[0];
    const aerolinea: AerolineaEntity = await service.findOne(storedAerolinea.id);
    expect(aerolinea).not.toBeNull();
    expect(aerolinea.nombre).toEqual(storedAerolinea.nombre);
    expect(aerolinea.id).toEqual(storedAerolinea.id);
    expect(aerolinea.descripcion).toEqual(storedAerolinea.descripcion);
    expect(aerolinea.fechaFundacion).toEqual(storedAerolinea.fechaFundacion);
    expect(aerolinea.paginaWeb).toEqual(storedAerolinea.paginaWeb);
    expect(aerolinea.aeropuertos).toEqual(storedAerolinea.aeropuertos);
  });

  it('findOne should throw an exception for an invalid airline id', async () => {
    await expect(() => service.findOne(faker.number.int()))
        .rejects.toMatchObject(new BusinessLogicException('La aerolínea con el ID proporcionado no fue encontrada', BusinessError.NOT_FOUND));
  });

  it('create should return a new airline', async () => {
    const aerolineaData: AerolineaEntity = {
      id: 0,
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
      fechaFundacion: faker.date.past(),
      paginaWeb: faker.internet.url(),
      aeropuertos: []
    };

    const newAerolinea: AerolineaEntity = await service.create(aerolineaData);
    expect(newAerolinea).not.toBeNull();

    const storedAerolinea: AerolineaEntity = await repository.findOne({
      where: { id: newAerolinea.id },
    });
    expect(storedAerolinea).not.toBeNull();
    expect(storedAerolinea.nombre).toEqual(newAerolinea.nombre);
  });

  it('create should throw an exception if foundation date is not in the past', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5); // 5 días en el futuro
    const aerolineaData: AerolineaEntity = {
      id: 0,
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
      fechaFundacion: futureDate,
      paginaWeb: faker.internet.url(),
      aeropuertos: []
    };
    await expect(() => service.create(aerolineaData))
        .rejects.toMatchObject(new BusinessLogicException('La fecha de fundación debe ser en el pasado.', BusinessError.PRECONDITION_FAILED));
  });

  it('update should modify an airline', async () => {
    const aerolinea: AerolineaEntity = aerolineasList[0];
    aerolinea.nombre = 'Nuevo Nombre';
    aerolinea.descripcion = 'Nueva Descripción';

    const updatedAerolinea: AerolineaEntity = await service.update(
      aerolinea.id,
      aerolinea,
    );
    expect(updatedAerolinea).not.toBeNull();

    const storedAerolinea: AerolineaEntity = await repository.findOne({
      where: { id: aerolinea.id },
    });
    expect(storedAerolinea).not.toBeNull();
    expect(storedAerolinea.nombre).toEqual('Nuevo Nombre');
  });
  
  it('update should throw an exception if foundation date is not in the past', async () => {
    const aerolineaToUpdate: AerolineaEntity = aerolineasList[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    
    const updatedData = { ...aerolineaToUpdate, fechaFundacion: futureDate };

    await expect(() => service.update(aerolineaToUpdate.id, updatedData))
        .rejects.toMatchObject(new BusinessLogicException('La fecha de fundación debe ser en el pasado.', BusinessError.PRECONDITION_FAILED));
  });


  it('update should throw an exception for an invalid airline id', async () => {
    let aerolinea: AerolineaEntity = aerolineasList[0];
    aerolinea = { ...aerolinea, nombre: 'Nuevo Nombre' };
    await expect(() => service.update(faker.number.int(), aerolinea))
        .rejects.toMatchObject(new BusinessLogicException('La aerolínea con el ID proporcionado no fue encontrada', BusinessError.NOT_FOUND));
  });

  it('delete should remove an airline', async () => {
    const aerolinea: AerolineaEntity = aerolineasList[0];
    await service.delete(aerolinea.id);

    const deletedAerolinea: AerolineaEntity = await repository.findOne({
      where: { id: aerolinea.id },
    });
    expect(deletedAerolinea).toBeNull();
  });

  it('delete should throw an exception for an invalid airline id', async () => {
    await expect(() => service.delete(faker.number.int()))
        .rejects.toMatchObject(new BusinessLogicException('La aerolínea con el ID proporcionado no fue encontrada', BusinessError.NOT_FOUND));
  });
});
