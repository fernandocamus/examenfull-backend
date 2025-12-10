import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetodoEnvio } from './entities/metodo-envio.entity';
import { MetodosEnvioService } from './metodos-envio.service';
import { MetodosEnvioController } from './metodos-envio.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MetodoEnvio])],
  controllers: [MetodosEnvioController],
  providers: [MetodosEnvioService],
  exports: [MetodosEnvioService, TypeOrmModule],
})
export class MetodosEnvioModule {}
