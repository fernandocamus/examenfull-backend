import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EstadoPedido } from '../entities/pedido.constants';

export class UpdateEstadoPedidoDto {
  @ApiProperty({
    example: 'CONFIRMADO',
    description: 'Nuevo estado del pedido',
    enum: EstadoPedido,
  })
  @IsEnum(EstadoPedido)
  estado: EstadoPedido;

  @ApiPropertyOptional({
    example: 'Pedido confirmado y en preparación',
    description: 'Comentario sobre el cambio de estado',
  })
  @IsOptional()
  @IsString()
  comentario?: string;

  @ApiPropertyOptional({
    example: 'Cliente solicitó envío urgente',
    description: 'Notas internas del administrador',
  })
  @IsOptional()
  @IsString()
  notasAdmin?: string;

  @ApiPropertyOptional({
    example: 'TRACK123456789',
    description: 'Número de seguimiento del envío',
  })
  @IsOptional()
  @IsString()
  numeroSeguimiento?: string;
}
