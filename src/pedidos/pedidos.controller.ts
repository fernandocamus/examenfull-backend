import { Controller, Get, Post, Body, Patch, Param, Headers , ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto';
import { EstadoPedido } from './entities/pedido.constants';

@ApiTags('Pedidos')
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear pedido',
    description: 'Crea un nuevo pedido con los items especificados. Descuenta el stock automáticamente. Para testing, envía "x-user-id" en headers o usa ID 1 por defecto.'
  })
  @ApiHeader({
    name: 'x-user-id',
    required: false,
    description: 'ID del usuario (opcional para testing, si no se envía usa 1)',
    example: '1'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Pedido creado exitosamente',
    schema: {
      example: {
        id: 1,
        numeroPedido: 'PED-202412-00001',
        estado: 'PENDIENTE',
        total: 1190000,
        fechaHora: '2024-12-07T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Stock insuficiente o producto no disponible' })
  create(
    @Headers('x-user-id') userIdHeader: string,
    @Body() createPedidoDto: CreatePedidoDto
  ) {
    // Si viene el header, usarlo; si no, usar 1 por defecto
    const usuarioId = userIdHeader ? parseInt(userIdHeader) : 1;
    return this.pedidosService.create(usuarioId, createPedidoDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todos los pedidos',
    description: 'Obtiene todos los pedidos del sistema. Opcionalmente filtra por estado.'
  })
  @ApiQuery({ 
    name: 'estado', 
    required: false, 
    enum: EstadoPedido,
    description: 'Filtrar por estado del pedido'
  })
  @ApiResponse({ status: 200, description: 'Lista de pedidos' })
  findAll(@Query('estado') estado?: EstadoPedido) {
    if (estado) {
      return this.pedidosService.findByEstado(estado);
    }
    return this.pedidosService.findAll();
  }

  @Get('mis-pedidos')
  @ApiOperation({ 
    summary: 'Ver mis pedidos',
    description: 'Obtiene todos los pedidos del usuario. Envía "x-user-id" en headers.'
  })
  @ApiHeader({
    name: 'x-user-id',
    required: false,
    description: 'ID del usuario',
    example: '1'
  })
  @ApiResponse({ status: 200, description: 'Lista de mis pedidos' })
  findByUser(@Headers('x-user-id') userIdHeader: string) {
    const usuarioId = userIdHeader ? parseInt(userIdHeader) : 1;
    return this.pedidosService.findByUser(usuarioId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Ver detalle de pedido',
    description: 'Obtiene los detalles completos de un pedido específico'
  })
  @ApiParam({ name: 'id', description: 'ID del pedido' })
  @ApiResponse({ status: 200, description: 'Detalle del pedido' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pedidosService.findOne(id);
  }

  @Patch(':id/estado')
  @ApiOperation({ 
    summary: 'Actualizar estado del pedido',
    description: 'Cambia el estado de un pedido y registra el cambio en el historial'
  })
  @ApiParam({ name: 'id', description: 'ID del pedido' })
  @ApiHeader({
    name: 'x-user-id',
    required: false,
    description: 'ID del usuario que actualiza',
    example: '1'
  })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Transición de estado no válida' })
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-user-id') userIdHeader: string,
    @Body() updateEstadoPedidoDto: UpdateEstadoPedidoDto,
  ) {
    const usuarioId = userIdHeader ? parseInt(userIdHeader) : 1;
    return this.pedidosService.updateEstado(
      id,
      usuarioId,
      updateEstadoPedidoDto,
    );
  }
}