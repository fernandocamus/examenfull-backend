import { IsString, IsNumber, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator';

export class CreateMetodoEnvioDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  costo: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tiempoEstimado?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
} 
