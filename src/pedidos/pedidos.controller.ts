import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolUsuario } from '../usuarios/entities/usuario.entity';
import { EstadoPedido } from './entities/pedido.constants';

@ApiTags('Pedidos')
@Controller('pedidos')
@ApiBearerAuth('JWT-auth')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Crear pedido',
    description: 'Crea un nuevo pedido con los items especificados. Descuenta el stock automáticamente.'
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
  create(@CurrentUser() user: any, @Body() createPedidoDto: CreatePedidoDto) {
    return this.pedidosService.create(user.sub, createPedidoDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ 
    summary: 'Listar todos los pedidos (ADMIN)',
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
    description: 'Obtiene todos los pedidos del usuario autenticado'
  })
  @ApiResponse({ status: 200, description: 'Lista de mis pedidos' })
  findByUser(@CurrentUser() user: any) {
    return this.pedidosService.findByUser(user.sub);
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
  @UseGuards(RolesGuard)
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ 
    summary: 'Actualizar estado del pedido (ADMIN)',
    description: 'Cambia el estado de un pedido y registra el cambio en el historial'
  })
  @ApiParam({ name: 'id', description: 'ID del pedido' })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente' })
  @ApiResponse({ status: 400, description: 'Transición de estado no válida' })
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() updateEstadoPedidoDto: UpdateEstadoPedidoDto,
  ) {
    return this.pedidosService.updateEstado(
      id,
      user.sub,
      updateEstadoPedidoDto,
    );
  }
}
