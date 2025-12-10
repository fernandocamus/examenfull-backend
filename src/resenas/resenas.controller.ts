import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ResenasService } from './resenas.service';
import { CreateResenaDto } from './dto/create-resena.dto';
import { UpdateResenaDto } from './dto/update-resena.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('resenas')
export class ResenasController {
  constructor(private readonly resenasService: ResenasService) { }

  @Post()
  @ApiOperation({
    summary: 'Crear resena',
    description: 'Crear una resena.'
  })
  create(@Body() createResenaDto: CreateResenaDto) {
    const userIdPorDefecto = 1;
    return this.resenasService.create(userIdPorDefecto, createResenaDto);
  }

  @Get('producto/:productoId')
  @ApiOperation({
    summary: 'Ver resena por producto',
    description: 'Busca todas las resenas de un producto.'
  })
  findByProducto(@Param('productoId', ParseIntPipe) productoId: number) {
    return this.resenasService.findByProducto(productoId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Ver resenas por id',
    description: 'Busca una resena por su id.'
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.resenasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Edita una resena',
    description: 'Edita una resena mediante su id.'
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateResenaDto: UpdateResenaDto,
  ) {
    return this.resenasService.update(id, updateResenaDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Borra una resena',
    description: 'Borrar resena mediante su id.'
  })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.resenasService.delete(id);
  }
}
