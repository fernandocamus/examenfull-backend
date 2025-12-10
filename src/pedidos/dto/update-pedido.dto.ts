import { IsOptional, IsString, IsEnum } from 'class-validator';
import { MetodoPago } from '../entities/pedido.constants';

export class UpdatePedidoDto {
  @IsOptional()
  @IsEnum(MetodoPago)
  metodoPago?: MetodoPago;

  @IsOptional()
  @IsString()
  notasCliente?: string;

  @IsOptional()
  @IsString()
  notasAdmin?: string;

  @IsOptional()
  @IsString()
  numeroSeguimiento?: string;
}
