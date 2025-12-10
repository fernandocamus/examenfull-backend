import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarritoItem } from './entities/carrito-item.entity';
import { CarritoService } from './carrito.service';
import { CarritoController } from './carrito.controller';
import { ProductosModule } from '../productos/productos.module';

@Module({
  imports: [TypeOrmModule.forFeature([CarritoItem]), ProductosModule],
  controllers: [CarritoController],
  providers: [CarritoService],
  exports: [CarritoService, TypeOrmModule],
})
export class CarritoModule {}
