import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { MetodosEnvioService } from './metodos-envio.service';
import { CreateMetodoEnvioDto } from './dto/create-metodo-envio.dto';
import { UpdateMetodoEnvioDto } from './dto/update-metodo-envio.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('metodos-envio')
export class MetodosEnvioController {
  constructor(private readonly metodosEnvioService: MetodosEnvioService) { }

  @Post()
  @ApiOperation({
      summary: 'Crear metodo de envio',
      description: 'Crea un un metodo de envio.'
    })
  create(@Body() createMetodoEnvioDto: CreateMetodoEnvioDto) {
    return this.metodosEnvioService.create(createMetodoEnvioDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Ver todos los metodos de envio',
    description: 'Busca todos los metodos de envio.'
  })
  findAll() {
    return this.metodosEnvioService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Ver metodo de envio por id',
    description: 'Busca un metodo de envio por su id.'
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.metodosEnvioService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Edita un metodo de envio',
    description: 'Edita un metodo de envio mediante su id.'
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMetodoEnvioDto: UpdateMetodoEnvioDto,
  ) {
    return this.metodosEnvioService.update(id, updateMetodoEnvioDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Borra un metodo de envio',
    description: 'Borrar metodo de envio mediante su id.'
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.metodosEnvioService.remove(id);
  }
}
