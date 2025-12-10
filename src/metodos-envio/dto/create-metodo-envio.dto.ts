import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, MaxLength } from 'class-validator';

export class CreateMetodoEnvioDto {
  @ApiProperty({
    example: 'Envío Express',
    description: 'Nombre del método de envío',
    maxLength: 100
  })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiPropertyOptional({
    example: 'Entrega en 24-48 horas',
    description: 'Descripción del método de envío'
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    example: 5000,
    description: 'Costo del envío en pesos',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  costo: number;

  @ApiPropertyOptional({
    example: '1-2 días hábiles',
    description: 'Tiempo estimado de entrega',
    maxLength: 100
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tiempoEstimado?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si el método de envío está activo',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
} 
