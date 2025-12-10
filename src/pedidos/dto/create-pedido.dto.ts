import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsEnum, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MetodoPago } from '../entities/pedido.constants';

export class ItemPedidoDto {
  @ApiProperty({
    example: 1,
    description: 'ID del producto',
  })
  @IsInt()
  productoId: number;

  @ApiProperty({
    example: 2,
    description: 'Cantidad del producto',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CreatePedidoDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la dirección de envío',
  })
  @IsInt()
  direccionEnvioId: number;

  @ApiProperty({
    description: 'Lista de items del pedido',
    type: [ItemPedidoDto],
    example: [
      { productoId: 1, cantidad: 2 },
      { productoId: 2, cantidad: 1 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  items: ItemPedidoDto[];

  @ApiProperty({
    example: 'TRANSFERENCIA',
    description: 'Método de pago seleccionado',
    enum: MetodoPago,
  })
  @IsEnum(MetodoPago)
  metodoPago: MetodoPago;

  @ApiPropertyOptional({
    example: 'Entregar en horario de oficina',
    description: 'Notas adicionales del cliente',
  })
  @IsOptional()
  @IsString()
  notasCliente?: string;
}
