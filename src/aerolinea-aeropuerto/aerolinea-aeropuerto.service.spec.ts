import { Test, TestingModule } from '@nestjs/testing';
import { AerolineaAeropuertoService } from './aerolinea-aeropuerto.service';
import { AerolineaEntity } from '../aerolinea/aerolinea.entity';
import { AeropuertoEntity } from '../aeropuerto/aeropuerto.entity';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';

describe('AerolineaAeropuertoService', () => {
  let service: AerolineaAeropuertoService;
  let aerolineaRepository: Repository<AerolineaEntity>;
  let aeropuertoRepository: Repository<AeropuertoEntity>;
  let aerolinea: AerolineaEntity;
  let aeropuertosList: AeropuertoEntity[];

  const seedDatabase = async () => {
    aeropuertoRepository.clear();
    aerolineaRepository.clear();

    aeropuertosList = [];
    for (let i = 0; i < 5; i++) {
      const aeropuerto: AeropuertoEntity = await aeropuertoRepository.save({
        nombre: faker.company.name() + " Airport",
        codigo: faker.string.alpha({ length: 3, casing: 'upper' }),
        pais: faker.location.country(),
        ciudad: faker.location.city(),
      });
      aeropuertosList.push(aeropuerto);
    }

    aerolinea = await aerolineaRepository.save({
      nombre: faker.company.name(),
      descripcion: faker.lorem.sentence(),
      fechaFundacion: faker.date.past(),
      paginaWeb: faker.internet.url(),
      aeropuertos: aeropuertosList.slice(0,2) // Asociar los primeros 2 aeropuertos
    });
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [AerolineaAeropuertoService],
    }).compile();

    service = module.get<AerolineaAeropuertoService>(AerolineaAeropuertoService);
    aerolineaRepository = module.get<Repository<AerolineaEntity>>(getRepositoryToken(AerolineaEntity));
    aeropuertoRepository = module.get<Repository<AeropuertoEntity>>(getRepositoryToken(AeropuertoEntity));
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addAirportToAirline should add an airport to an airline', async () => {
    const newAeropuerto: AeropuertoEntity = aeropuertosList[2]; // Un aeropuerto no asociado inicialmente
    const modifiedAerolinea: AerolineaEntity = await service.addAirportToAirline(aerolinea.id, newAeropuerto.id);
    
    expect(modifiedAerolinea.aeropuertos.length).toBe(3);
    expect(modifiedAerolinea.aeropuertos.find(a => a.id === newAeropuerto.id)).not.toBeUndefined();

    const storedAerolinea: AerolineaEntity = await aerolineaRepository.findOne({ where: { id: aerolinea.id }, relations: ['aeropuertos'] });
    expect(storedAerolinea.aeropuertos.find(a => a.id === newAeropuerto.id)).not.toBeUndefined();
  });

  it('addAirportToAirline should throw an exception for an invalid airport', async () => {
    await expect(() => service.addAirportToAirline(aerolinea.id, faker.number.int()))
        .rejects.toMatchObject(new BusinessLogicException("El aeropuerto con el ID proporcionado no fue encontrado", BusinessError.NOT_FOUND));
  });

  it('addAirportToAirline should throw an exception for an invalid airline', async () => {
    const newAeropuerto: AeropuertoEntity = aeropuertosList[0];
    await expect(() => service.addAirportToAirline(faker.number.int(), newAeropuerto.id))
        .rejects.toMatchObject(new BusinessLogicException("La aerolínea con el ID proporcionado no fue encontrada", BusinessError.NOT_FOUND));
  });

  it('addAirportToAirline should throw an exception if airport is already associated', async () => {
    const existingAeropuerto: AeropuertoEntity = aerolinea.aeropuertos[0];
     await expect(() => service.addAirportToAirline(aerolinea.id, existingAeropuerto.id))
        .rejects.toMatchObject(new BusinessLogicException("El aeropuerto ya está asociado a la aerolínea", BusinessError.PRECONDITION_FAILED));
  });

  it('findAirportsFromAirline should return airports by airline', async () => {
    const airports: AeropuertoEntity[] = await service.findAirportsFromAirline(aerolinea.id);
    expect(airports.length).toBe(2);
  });

  it('findAirportsFromAirline should throw an exception for an invalid airline', async () => {
    await expect(() => service.findAirportsFromAirline(faker.number.int()))
        .rejects.toMatchObject(new BusinessLogicException("La aerolínea con el ID proporcionado no fue encontrada", BusinessError.NOT_FOUND));
  });

  it('findAirportFromAirline should return an airport by airline and airport id', async () => {
    const airportToFind: AeropuertoEntity = aerolinea.aeropuertos[0];
    const foundAirport: AeropuertoEntity = await service.findAirportFromAirline(aerolinea.id, airportToFind.id);
    expect(foundAirport).not.toBeNull();
    expect(foundAirport.id).toEqual(airportToFind.id);
  });

  it('findAirportFromAirline should throw an exception for an invalid airport', async () => {
    await expect(() => service.findAirportFromAirline(aerolinea.id, faker.number.int()))
        .rejects.toMatchObject(new BusinessLogicException("El aeropuerto con el ID proporcionado no fue encontrado", BusinessError.NOT_FOUND));
  });

  it('findAirportFromAirline should throw an exception for an invalid airline', async () => {
    const airport: AeropuertoEntity = aeropuertosList[0];
    await expect(() => service.findAirportFromAirline(faker.number.int(), airport.id))
        .rejects.toMatchObject(new BusinessLogicException("La aerolínea con el ID proporcionado no fue encontrada", BusinessError.NOT_FOUND));
  });

  it('findAirportFromAirline should throw an exception if airport is not associated with airline', async () => {
    const unassociatedAirport: AeropuertoEntity = aeropuertosList[3]; // Uno no asociado
    await expect(() => service.findAirportFromAirline(aerolinea.id, unassociatedAirport.id))
        .rejects.toMatchObject(new BusinessLogicException("El aeropuerto con el ID proporcionado no está asociado a la aerolínea", BusinessError.PRECONDITION_FAILED));
  });

  it('updateAirportsFromAirline should update the list of airports for an airline', async () => {
    const newAirportsList = [aeropuertosList[3], aeropuertosList[4]];
    const updatedAerolinea: AerolineaEntity = await service.updateAirportsFromAirline(aerolinea.id, newAirportsList);

    expect(updatedAerolinea.aeropuertos.length).toBe(2);
    expect(updatedAerolinea.aeropuertos.map(a => a.id).sort()).toEqual(newAirportsList.map(a => a.id).sort());
  });

  it('updateAirportsFromAirline should throw an exception for an invalid airline', async () => {
    const newAirportsList = [aeropuertosList[0]];
    await expect(() => service.updateAirportsFromAirline(faker.number.int(), newAirportsList))
        .rejects.toMatchObject(new BusinessLogicException("La aerolínea con el ID proporcionado no fue encontrada", BusinessError.NOT_FOUND));
  });

  it('updateAirportsFromAirline should throw an exception if any airport in the list is invalid', async () => {
    const invalidAirport = { id: faker.number.int() } as AeropuertoEntity; // Simulando un aeropuerto inválido
    const newAirportsList = [aeropuertosList[0], invalidAirport];
    await expect(() => service.updateAirportsFromAirline(aerolinea.id, newAirportsList))
        .rejects.toMatchObject(new BusinessLogicException("El aeropuerto con el ID proporcionado no fue encontrado", BusinessError.NOT_FOUND));
  });

  it('deleteAirportFromAirline should remove an airport from an airline', async () => {
    const airportToDelete: AeropuertoEntity = aerolinea.aeropuertos[0];
    await service.deleteAirportFromAirline(aerolinea.id, airportToDelete.id);

    const storedAerolinea: AerolineaEntity = await aerolineaRepository.findOne({ where: { id: aerolinea.id }, relations: ['aeropuertos'] });
    expect(storedAerolinea.aeropuertos.length).toBe(1);
    expect(storedAerolinea.aeropuertos.find(a => a.id === airportToDelete.id)).toBeUndefined();
  });

  it('deleteAirportFromAirline should throw an exception for an invalid airport', async () => {
    await expect(() => service.deleteAirportFromAirline(aerolinea.id, faker.number.int()))
        .rejects.toMatchObject(new BusinessLogicException("El aeropuerto con el ID proporcionado no fue encontrado", BusinessError.NOT_FOUND));
  });

  it('deleteAirportFromAirline should throw an exception for an invalid airline', async () => {
    const airport: AeropuertoEntity = aeropuertosList[0];
    await expect(() => service.deleteAirportFromAirline(faker.number.int(), airport.id))
        .rejects.toMatchObject(new BusinessLogicException("La aerolínea con el ID proporcionado no fue encontrada", BusinessError.NOT_FOUND));
  });

  it('deleteAirportFromAirline should throw an exception if airport is not associated with airline', async () => {
    const unassociatedAirport: AeropuertoEntity = aeropuertosList[4]; // Uno no asociado
    await expect(() => service.deleteAirportFromAirline(aerolinea.id, unassociatedAirport.id))
        .rejects.toMatchObject(new BusinessLogicException("El aeropuerto con el ID proporcionado no está asociado a la aerolínea", BusinessError.PRECONDITION_FAILED));
  });
});
