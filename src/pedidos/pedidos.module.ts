import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { HistorialEstadoPedido } from './entities/historial-estado-pedido.entity';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { ProductosModule } from '../productos/productos.module';
import { DireccionesEnvioModule } from '../direcciones-envio/direcciones-envio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, DetallePedido, HistorialEstadoPedido]),
    ProductosModule,
    DireccionesEnvioModule,
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService, TypeOrmModule],
})
export class PedidosModule {}
