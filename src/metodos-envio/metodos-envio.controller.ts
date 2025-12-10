import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { MetodosEnvioService } from './metodos-envio.service';
import { CreateMetodoEnvioDto } from './dto/create-metodo-envio.dto';
import { UpdateMetodoEnvioDto } from './dto/update-metodo-envio.dto';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolUsuario } from '../usuarios/entities/usuario.entity';

@Controller('metodos-envio')
export class MetodosEnvioController {
  constructor(private readonly metodosEnvioService: MetodosEnvioService) {}

  @Post()
  @UseGuards( RolesGuard)
  @Roles(RolUsuario.ADMIN)
  create(@Body() createMetodoEnvioDto: CreateMetodoEnvioDto) {
    return this.metodosEnvioService.create(createMetodoEnvioDto);
  }

  @Get()
  findAll() {
    return this.metodosEnvioService.findAll();
  }

  @Get('activos')
  findAllActive() {
    return this.metodosEnvioService.findAllActive();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.metodosEnvioService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMetodoEnvioDto: UpdateMetodoEnvioDto,
  ) {
    return this.metodosEnvioService.update(id, updateMetodoEnvioDto);
  }

  @Delete(':id')
  @UseGuards( RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.metodosEnvioService.remove(id);
  }
}
