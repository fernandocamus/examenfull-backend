import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt, Min, MaxLength } from 'class-validator';

export class CreateCategoriaDto {
  @ApiProperty({
    example: 'Electrónica',
    description: 'Nombre de la categoría',
  })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiPropertyOptional({
    example: 'Productos electrónicos y tecnología',
    description: 'Descripción detallada de la categoría',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si la categoría está activa',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Orden de visualización de la categoría',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;
}
