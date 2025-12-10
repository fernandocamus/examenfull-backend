import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) { }

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const usuario = this.usuariosRepository.create(createUsuarioDto);
    return await this.usuariosRepository.save(usuario);
  }

  async findAll(): Promise<Usuario[]> {
    return await this.usuariosRepository.find({
      order: { fechaRegistro: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return usuario;
  }

  async findOneByEmail(correo: string): Promise<Usuario | null> {
    return await this.usuariosRepository.findOne({
      where: { correo },
    });
  }

  async findOneByEmailWithPassword(correo: string): Promise<Usuario | null> {
    return await this.usuariosRepository
      .createQueryBuilder('usuario')
      .where('usuario.correo = :correo', { correo })
      .addSelect('usuario.contrasena')
      .getOne();
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    const usuario = await this.findOne(id);

    if (updateUsuarioDto.contrasena) {
      updateUsuarioDto.contrasena = await bcryptjs.hash(
        updateUsuarioDto.contrasena,
        10,
      );
    }

    if (updateUsuarioDto.correo && updateUsuarioDto.correo !== usuario.correo) {
      const emailExists = await this.findOneByEmail(updateUsuarioDto.correo);
      if (emailExists) {
        throw new BadRequestException('El correo ya está en uso');
      }
    }

    Object.assign(usuario, updateUsuarioDto);
    return await this.usuariosRepository.save(usuario);
  }

  async remove(id: number): Promise<{ message: string }> {
    const usuario = await this.findOne(id);
    await this.usuariosRepository.remove(usuario);

    return { message: `Usuario ${id} eliminado correctamente` };
  }

  async toggleActive(id: number): Promise<Usuario> {
    const usuario = await this.findOne(id);
    return await this.usuariosRepository.save(usuario);
  }
}