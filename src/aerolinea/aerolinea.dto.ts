import { IsString, IsNotEmpty, IsUrl, IsOptional, IsNumber, IsDate } from 'class-validator';

export class AerolineaDto {
  @IsNumber()
  @IsOptional()
  readonly id?: number;

  @IsString()
  @IsNotEmpty()
  readonly nombre: string;

  @IsString()
  @IsNotEmpty()
  readonly descripcion: string;

  @IsDate()
  @IsNotEmpty()
  readonly fechaFundacion: Date;

  @IsUrl()
  @IsNotEmpty()
  readonly paginaWeb: string;
}

export class AerolineaUpdateDto {
  @IsString()
  @IsOptional()
  readonly nombre?: string;

  @IsString()
  @IsOptional()
  readonly descripcion?: string;

  @IsDate()
  @IsOptional()
  readonly fechaFundacion?: Date;

  @IsUrl()
  @IsOptional()
  readonly paginaWeb?: string;
}
