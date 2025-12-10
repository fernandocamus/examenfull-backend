import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentaDiaria } from './entities/venta-diaria.entity';
import { ReportesService } from './reportes.service';
import { ReportesController } from './reportes.controller';
import { PedidosModule } from '../pedidos/pedidos.module';

@Module({
  imports: [TypeOrmModule.forFeature([VentaDiaria]), PedidosModule],
  controllers: [ReportesController],
  providers: [ReportesService],
  exports: [ReportesService, TypeOrmModule],
})
export class ReportesModule {}
