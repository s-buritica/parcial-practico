import { IsString, IsNotEmpty, Length, IsOptional, IsNumber } from 'class-validator';

export class AeropuertoDto {
  @IsNumber()
  @IsOptional()
  readonly id?: number;

  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 3, { message: 'El código del aeropuerto debe tener exactamente 3 caracteres.'})
  readonly codigo: string;

  @IsString()
  @IsNotEmpty()
  readonly pais: string;

  @IsString()
  @IsNotEmpty()
  readonly ciudad: string;
}

export class AeropuertoUpdateDto {
  @IsString()
  @IsOptional()
  readonly nombre?: string;

  @IsString()
  @IsOptional()
  @Length(3, 3, { message: 'El código del aeropuerto debe tener exactamente 3 caracteres.'})
  readonly codigo?: string;

  @IsString()
  @IsOptional()
  readonly pais?: string;

  @IsString()
  @IsOptional()
  readonly ciudad?: string;
}
