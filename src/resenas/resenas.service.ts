import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resena } from './entities/resena.entity';
import { CreateResenaDto } from './dto/create-resena.dto';
import { UpdateResenaDto } from './dto/update-resena.dto';

@Injectable()
export class ResenasService {
  constructor(
    @InjectRepository(Resena)
    private readonly resenasRepository: Repository<Resena>,
  ) {}

  async create(usuarioId: number, createResenaDto: CreateResenaDto): Promise<Resena> {
    const existe = await this.resenasRepository.findOne({
      where: {
        usuarioId,
        productoId: createResenaDto.productoId,
        pedidoId: createResenaDto.pedidoId,
      },
    });

    if (existe) {
      throw new BadRequestException('Ya dejaste una reseña para este producto');
    }

    const resena = this.resenasRepository.create({
      ...createResenaDto,
      usuarioId,
    });

    return await this.resenasRepository.save(resena);
  }

  async findByProducto(productoId: number): Promise<Resena[]> {
    return await this.resenasRepository.find({
      where: { productoId },
      relations: ['usuario'],
      order: { fechaCreacion: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Resena> {
    const resena = await this.resenasRepository.findOne({
      where: { id },
      relations: ['usuario', 'producto'],
    });

    if (!resena) {
      throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
    }

    return resena;
  }

  async update(id: number, updateResenaDto: UpdateResenaDto): Promise<Resena> {
    const resena = await this.findOne(id);
    Object.assign(resena, updateResenaDto);
    return await this.resenasRepository.save(resena);
  }

  async delete(id: number): Promise<void> {
    const resena = await this.findOne(id);
    await this.resenasRepository.remove(resena);
  }
}
