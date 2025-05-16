import { AerolineaEntity } from '../aerolinea/aerolinea.entity';
import { Column, Entity, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

@Entity()
export class AeropuertoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  codigo: string; // Código IATA o similar

  @Column()
  pais: string;

  @Column()
  ciudad: string;

  @ManyToMany(() => AerolineaEntity, aerolinea => aerolinea.aeropuertos)
  aerolineas: AerolineaEntity[];
}
