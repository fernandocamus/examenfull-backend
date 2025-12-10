import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { MetodosEnvioService } from './metodos-envio.service';
import { CreateMetodoEnvioDto } from './dto/create-metodo-envio.dto';
import { UpdateMetodoEnvioDto } from './dto/update-metodo-envio.dto';

@Controller('metodos-envio')
export class MetodosEnvioController {
  constructor(private readonly metodosEnvioService: MetodosEnvioService) { }

  @Post()
  create(@Body() createMetodoEnvioDto: CreateMetodoEnvioDto) {
    return this.metodosEnvioService.create(createMetodoEnvioDto);
  }

  @Get()
  findAll() {
    return this.metodosEnvioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.metodosEnvioService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMetodoEnvioDto: UpdateMetodoEnvioDto,
  ) {
    return this.metodosEnvioService.update(id, updateMetodoEnvioDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.metodosEnvioService.remove(id);
  }
}
