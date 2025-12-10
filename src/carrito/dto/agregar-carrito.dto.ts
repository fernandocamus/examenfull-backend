import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AddToCarritoDto {
  @ApiProperty({
    example: 1,
    description: 'ID del producto a agregar al carrito',
  })
  @IsInt()
  productoId: number;

  @ApiProperty({
    example: 2,
    description: 'Cantidad de productos a agregar',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  cantidad: number;
}
