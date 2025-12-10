import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsInt, Min, MaxLength, IsArray, IsObject } from 'class-validator';

export class CreateProductoDto {
  @ApiProperty({
    example: 'Laptop Dell Inspiron 15',
    description: 'Nombre del producto',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  nombre: string;

  @ApiPropertyOptional({
    example: 'Laptop con procesador Intel i5, 8GB RAM, 256GB SSD',
    description: 'Descripción detallada del producto',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    example: 500000,
    description: 'Precio base del producto sin IVA',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  precioBase: number;

  @ApiPropertyOptional({
    example: 19,
    description: 'Porcentaje de IVA aplicado',
    minimum: 0,
    default: 19,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  iva?: number;

  @ApiProperty({
    example: 10,
    description: 'Cantidad disponible en stock',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  stockActual: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Stock mínimo para alerta',
    minimum: 0,
    default: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockMinimo?: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la categoría a la que pertenece el producto',
  })
  @IsInt()
  categoriaId: number;

  @ApiPropertyOptional({
    example: 'https://ejemplo.com/producto.jpg',
    description: 'URL de la imagen principal del producto',
  })
  @IsOptional()
  @IsString()
  rutaImagen?: string;

  @ApiPropertyOptional({
    example: ['https://ejemplo.com/img1.jpg', 'https://ejemplo.com/img2.jpg'],
    description: 'URLs de imágenes adicionales del producto',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  imagenesAdicionales?: string[];

  @ApiPropertyOptional({
    example: false,
    description: 'Indica si el producto es destacado',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  destacado?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Indica si el producto está activo',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({
    example: 2.5,
    description: 'Peso del producto en kg',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  peso?: number;

  @ApiPropertyOptional({
    example: { largo: 30, ancho: 20, alto: 5 },
    description: 'Dimensiones del producto en cm',
  })
  @IsOptional()
  @IsObject()
  dimensiones?: {
    largo: number;
    ancho: number;
    alto: number;
  };
}
