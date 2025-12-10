import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Resena } from './entities/resena.entity';
import { ResenasService } from './resenas.service';
import { ResenasController } from './resenas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Resena])],
  controllers: [ResenasController],
  providers: [ResenasService],
  exports: [ResenasService, TypeOrmModule],
})
export class ResenasModule {}
