import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DireccionEnvio } from './entities/direccion-envio.entity';
import { DireccionesEnvioService } from './direcciones-envio.service';
import { DireccionesEnvioController } from './direcciones-envio.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DireccionEnvio])],
  controllers: [DireccionesEnvioController],
  providers: [DireccionesEnvioService],
  exports: [DireccionesEnvioService, TypeOrmModule],
})
export class DireccionesEnvioModule {}
