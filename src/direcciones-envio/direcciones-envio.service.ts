import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DireccionEnvio } from './entities/direccion-envio.entity';
import { CreateDireccionEnvioDto } from './dto/create-direccion-envio.dto';
import { UpdateDireccionEnvioDto } from './dto/update-direccion-envio.dto';

@Injectable()
export class DireccionesEnvioService {
  constructor(
    @InjectRepository(DireccionEnvio)
    private readonly direccionesRepository: Repository<DireccionEnvio>,
  ) {}

  async create(
    usuarioId: number,
    createDireccionEnvioDto: CreateDireccionEnvioDto,
  ): Promise<DireccionEnvio> {
    if (createDireccionEnvioDto.esPrincipal) {
      await this.direccionesRepository.update(
        { usuarioId, esPrincipal: true },
        { esPrincipal: false },
      );
    }

    const direccion = this.direccionesRepository.create({
      ...createDireccionEnvioDto,
      usuarioId,
    });

    return await this.direccionesRepository.save(direccion);
  }

  async findAllByUser(usuarioId: number): Promise<DireccionEnvio[]> {
    return await this.direccionesRepository.find({
      where: { usuarioId },
      order: { esPrincipal: 'DESC', fechaCreacion: 'DESC' },
    });
  }

  async findOne(id: number, usuarioId: number): Promise<DireccionEnvio> {
    const direccion = await this.direccionesRepository.findOne({
      where: { id, usuarioId },
    });

    if (!direccion) {
      throw new NotFoundException(`Dirección con ID ${id} no encontrada`);
    }

    return direccion;
  }

  async findPrincipal(usuarioId: number): Promise<DireccionEnvio> {
    const direccion = await this.direccionesRepository.findOne({
      where: { usuarioId, esPrincipal: true },
    });

    if (!direccion) {
      throw new NotFoundException('No tienes una dirección principal configurada');
    }

    return direccion;
  }

  async update(
    id: number,
    usuarioId: number,
    updateDireccionEnvioDto: UpdateDireccionEnvioDto,
  ): Promise<DireccionEnvio> {
    const direccion = await this.findOne(id, usuarioId);

    if (updateDireccionEnvioDto.esPrincipal) {
      await this.direccionesRepository.update(
        { usuarioId, esPrincipal: true },
        { esPrincipal: false },
      );
    }

    Object.assign(direccion, updateDireccionEnvioDto);
    return await this.direccionesRepository.save(direccion);
  }

  async remove(id: number, usuarioId: number): Promise<void> {
    const direccion = await this.findOne(id, usuarioId);
    await this.direccionesRepository.remove(direccion);
  }

  async setPrincipal(id: number, usuarioId: number): Promise<DireccionEnvio> {
    const direccion = await this.findOne(id, usuarioId);

    await this.direccionesRepository.update(
      { usuarioId, esPrincipal: true },
      { esPrincipal: false },
    );

    direccion.esPrincipal = true;
    return await this.direccionesRepository.save(direccion);
  }
}
