import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetodoEnvio } from './entities/metodo-envio.entity';
import { CreateMetodoEnvioDto } from './dto/create-metodo-envio.dto';
import { UpdateMetodoEnvioDto } from './dto/update-metodo-envio.dto';

@Injectable()
export class MetodosEnvioService {
  constructor(
    @InjectRepository(MetodoEnvio)
    private readonly metodosRepository: Repository<MetodoEnvio>,
  ) {}

  async create(createMetodoEnvioDto: CreateMetodoEnvioDto): Promise<MetodoEnvio> {
    const metodo = this.metodosRepository.create(createMetodoEnvioDto);
    return await this.metodosRepository.save(metodo);
  }

  async findAll(): Promise<MetodoEnvio[]> {
    return await this.metodosRepository.find();
  }

  async findAllActive(): Promise<MetodoEnvio[]> {
    return await this.metodosRepository.find({
      where: { activo: true },
    });
  }

  async findOne(id: number): Promise<MetodoEnvio> {
    const metodo = await this.metodosRepository.findOne({
      where: { id },
    });

    if (!metodo) {
      throw new NotFoundException(`Método de envío con ID ${id} no encontrado`);
    }

    return metodo;
  }

  async update(
    id: number,
    updateMetodoEnvioDto: UpdateMetodoEnvioDto,
  ): Promise<MetodoEnvio> {
    const metodo = await this.findOne(id);
    Object.assign(metodo, updateMetodoEnvioDto);
    return await this.metodosRepository.save(metodo);
  }

  async remove(id: number): Promise<void> {
    const metodo = await this.findOne(id);
    await this.metodosRepository.remove(metodo);
  }
}
