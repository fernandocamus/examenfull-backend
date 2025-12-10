import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CarritoService } from './carrito.service';
import { AddToCarritoDto } from './dto/agregar-carrito.dto';
import { UpdateCarritoItemDto } from './dto/update-carrito-item.dto';

@ApiTags('Carrito')
@Controller('carrito')
export class CarritoController {
  constructor(private readonly carritoService: CarritoService) {}

  @Post(':usuarioId')
  @ApiOperation({ 
    summary: 'Agregar producto al carrito',
    description: 'Agrega un producto al carrito del usuario.'
  })
  @ApiParam({ name: 'usuarioId', description: 'ID del usuario', example: 1 })
  @ApiResponse({ status: 201, description: 'Producto agregado al carrito' })
  addItem(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Body() addToCarritoDto: AddToCarritoDto
  ) {
    return this.carritoService.addItem(usuarioId, addToCarritoDto);
  }

  @Get(':usuarioId')
  @ApiOperation({ 
    summary: 'Ver carrito',
    description: 'Obtiene todos los items del carrito con subtotales e IVA calculado'
  })
  @ApiParam({ name: 'usuarioId', description: 'ID del usuario', example: 1 })
  @ApiResponse({ 
    status: 200, 
    description: 'Carrito obtenido exitosamente'
  })
  getCarrito(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.carritoService.getCarrito(usuarioId);
  }

  @Patch(':usuarioId/:id')
  @ApiOperation({ 
    summary: 'Actualizar cantidad de item',
    description: 'Modifica la cantidad de un producto en el carrito'
  })
  @ApiParam({ name: 'usuarioId', description: 'ID del usuario', example: 1 })
  @ApiParam({ name: 'id', description: 'ID del item del carrito', example: 1 })
  @ApiResponse({ status: 200, description: 'Cantidad actualizada' })
  updateItem(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCarritoItemDto: UpdateCarritoItemDto,
  ) {
    return this.carritoService.updateItem(id, usuarioId, updateCarritoItemDto);
  }

  @Delete(':usuarioId/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Eliminar item del carrito',
    description: 'Elimina un producto del carrito'
  })
  @ApiParam({ name: 'usuarioId', description: 'ID del usuario', example: 1 })
  @ApiParam({ name: 'id', description: 'ID del item del carrito', example: 1 })
  @ApiResponse({ status: 204, description: 'Item eliminado' })
  removeItem(
    @Param('usuarioId', ParseIntPipe) usuarioId: number,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.carritoService.removeItem(id, usuarioId);
  }

  @Delete(':usuarioId')
  @ApiOperation({ 
    summary: 'Vaciar carrito',
    description: 'Elimina todos los items del carrito del usuario'
  })
  @ApiParam({ name: 'usuarioId', description: 'ID del usuario', example: 1 })
  @ApiResponse({ status: 204, description: 'Carrito vaciado' })
  clearCarrito(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.carritoService.clearCarrito(usuarioId);
  }
}