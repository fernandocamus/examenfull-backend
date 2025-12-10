import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolUsuario } from './entities/usuario.entity';
import { ApiOperation } from '@nestjs/swagger';

@Controller('usuarios')

export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Get()
  @ApiOperation({
    summary: 'Ver todos los usuarios',
    description: 'Busca todos los usuarios creados.'
  })
  @Roles(RolUsuario.ADMIN)
  findAll() {
    return this.usuariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Ver usuario por id',
    description: 'Busca un usuarios por su id.'
  })
  @Roles(RolUsuario.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Borra un usuario',
    description: 'Borrar usuarios mediante su id.'
  })
  @Roles(RolUsuario.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}
