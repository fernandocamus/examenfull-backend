import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, MaxLength } from 'class-validator';

export class CreateDireccionEnvioDto {
  @ApiProperty({
    example: 'Casa',
    description: 'Alias o nombre de la dirección',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  alias: string;

  @ApiProperty({
    example: 'Juan Pérez González',
    description: 'Nombre completo del destinatario',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  nombreCompleto: string;

  @ApiProperty({
    example: '+56912345678',
    description: 'Teléfono de contacto',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  telefono: string;

  @ApiProperty({
    example: 'Av. Libertador Bernardo O\'Higgins',
    description: 'Nombre de la calle',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  calle: string;

  @ApiProperty({
    example: '123',
    description: 'Número de la dirección',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20)
  numero: string;

  @ApiPropertyOptional({
    example: 'Depto 401',
    description: 'Número de departamento o piso',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  departamento?: string;

  @ApiProperty({
    example: 'Santiago',
    description: 'Ciudad',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  ciudad: string;

  @ApiProperty({
    example: 'Región Metropolitana',
    description: 'Región o estado',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  region: string;

  @ApiProperty({
    example: '8320000',
    description: 'Código postal',
    maxLength: 10,
  })
  @IsString()
  @MaxLength(10)
  codigoPostal: string;

  @ApiPropertyOptional({
    example: 'Chile',
    description: 'País',
    maxLength: 50,
    default: 'Chile',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  pais?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si es la dirección principal',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;
}
