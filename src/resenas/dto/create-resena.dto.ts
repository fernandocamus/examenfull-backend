import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateResenaDto {
  @ApiProperty({
    example: 1,
    description: 'ID del producto a reseñar',
  })
  @IsInt()
  productoId: number;

  @ApiProperty({
    example: 1,
    description: 'ID del pedido donde se compró el producto',
  })
  @IsInt()
  pedidoId: number;

  @ApiProperty({
    example: 5,
    description: 'Calificación del producto (1-5 estrellas)',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  calificacion: number;

  @ApiPropertyOptional({
    example: 'Excelente producto, muy recomendado',
    description: 'Comentario sobre el producto',
  })
  @IsOptional()
  @IsString()
  comentario?: string;
}
