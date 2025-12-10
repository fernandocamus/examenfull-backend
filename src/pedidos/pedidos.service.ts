import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { EstadoPedido } from './entities/pedido.constants';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { HistorialEstadoPedido } from './entities/historial-estado-pedido.entity';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto';
import { ProductosService } from '../productos/productos.service';
import { DireccionesEnvioService } from '../direcciones-envio/direcciones-envio.service';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidosRepository: Repository<Pedido>,
    @InjectRepository(DetallePedido)
    private readonly detallesRepository: Repository<DetallePedido>,
    @InjectRepository(HistorialEstadoPedido)
    private readonly historialRepository: Repository<HistorialEstadoPedido>,
    private readonly productosService: ProductosService,
    private readonly direccionesService: DireccionesEnvioService,
  ) {}

  async create(usuarioId: number, createPedidoDto: CreatePedidoDto): Promise<Pedido> {
    const { items, direccionEnvioId, metodoPago, notasCliente } = createPedidoDto;

    await this.direccionesService.findOne(direccionEnvioId, usuarioId);

    let subtotal = 0;
    let totalIva = 0;

    const detalles: DetallePedido[] = [];

    for (const item of items) {
      const producto = await this.productosService.findOne(item.productoId);

      if (!producto.activo) {
        throw new BadRequestException(`El producto ${producto.nombre} no está disponible`);
      }

      if (producto.stockActual < item.cantidad) {
        throw new BadRequestException(`Stock insuficiente para ${producto.nombre}`);
      }

      const precioBase = Number(producto.precioBase);
      const iva = Number(producto.iva);
      const precioConIva = precioBase * (1 + iva / 100);

      const subtotalSinIva = precioBase * item.cantidad;
      const subtotalIvaItem = subtotalSinIva * (iva / 100);
      const subtotalConIva = subtotalSinIva + subtotalIvaItem;

      subtotal += subtotalSinIva;
      totalIva += subtotalIvaItem;

      const detalle = this.detallesRepository.create({
        productoId: item.productoId,
        cantidad: item.cantidad,
        precioUnitarioBase: precioBase,
        iva: iva,
        precioUnitarioConIva: Number(precioConIva.toFixed(2)),
        subtotalSinIva: Number(subtotalSinIva.toFixed(2)),
        subtotalIva: Number(subtotalIvaItem.toFixed(2)),
        subtotalConIva: Number(subtotalConIva.toFixed(2)),
      });

      detalles.push(detalle);
    }

    const total = subtotal + totalIva;

    const numeroPedido = await this.generarNumeroPedido();

    const pedido = this.pedidosRepository.create({
      numeroPedido,
      usuario: { id: usuarioId }, 
      direccionEnvio: { id: direccionEnvioId }, 
      metodoPago,
      notasCliente,
      subtotal: Number(subtotal.toFixed(2)),
      totalIva: Number(totalIva.toFixed(2)),
      total: Number(total.toFixed(2)),
      estado: EstadoPedido.PENDIENTE,
    });

    const pedidoGuardado = await this.pedidosRepository.save(pedido);

    for (const detalle of detalles) {
      detalle.pedidoId = pedidoGuardado.id; 
      await this.detallesRepository.save(detalle);

      await this.productosService.descontarStock(
        detalle.productoId,
        detalle.cantidad,
      );
    }

    await this.crearHistorial(pedidoGuardado.id, undefined, EstadoPedido.PENDIENTE, usuarioId);

    return await this.findOne(pedidoGuardado.id);
  }

  async findAll(): Promise<Pedido[]> {
    return await this.pedidosRepository.find({
      relations: ['usuario', 'direccionEnvio'],
      order: { fechaHora: 'DESC' },
    });
  }

  async findByUser(usuarioId: number): Promise<Pedido[]> {
    return await this.pedidosRepository.find({
      where: { usuario: { id: usuarioId } }, 
      relations: ['direccionEnvio'],
      order: { fechaHora: 'DESC' },
    });
  }

  async findByEstado(estado: EstadoPedido): Promise<Pedido[]> {
    return await this.pedidosRepository.find({
      where: { estado },
      relations: ['usuario', 'direccionEnvio'],
      order: { fechaHora: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Pedido> {
    const pedido = await this.pedidosRepository.findOne({
      where: { id },
      relations: [
        'usuario',
        'direccionEnvio',
        'detalles',
        'detalles.producto',
        'historialEstados',
        'historialEstados.usuario',
      ],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    return pedido;
  }

  async updateEstado(
    id: number,
    usuarioId: number,
    updateEstadoPedidoDto: UpdateEstadoPedidoDto,
  ): Promise<Pedido> {
    const pedido = await this.findOne(id);
    const estadoAnterior = pedido.estado;
    const { estado, comentario, notasAdmin, numeroSeguimiento } = updateEstadoPedidoDto;

    this.validarTransicionEstado(estadoAnterior, estado);

    pedido.estado = estado;

    if (notasAdmin) {
      pedido.notasAdmin = notasAdmin;
    }

    if (numeroSeguimiento) {
      pedido.numeroSeguimiento = numeroSeguimiento;
    }

    const now = new Date();
    if (estado === EstadoPedido.CONFIRMADO && !pedido.fechaConfirmacion) {
      pedido.fechaConfirmacion = now;
    } else if (estado === EstadoPedido.ENVIADO && !pedido.fechaEnvio) {
      pedido.fechaEnvio = now;
    } else if (estado === EstadoPedido.ENTREGADO && !pedido.fechaEntrega) {
      pedido.fechaEntrega = now;
    }

    if (estado === EstadoPedido.CANCELADO) {
      for (const detalle of pedido.detalles) {
        await this.productosService.devolverStock(
          detalle.productoId,
          detalle.cantidad,
        );
      }
    }

    await this.pedidosRepository.save(pedido);

    await this.crearHistorial(id, estadoAnterior, estado, usuarioId, comentario);

    return await this.findOne(id);
  }

  private validarTransicionEstado(anterior: EstadoPedido, nuevo: EstadoPedido): void {
    const transicionesValidas: Record<EstadoPedido, EstadoPedido[]> = {
      [EstadoPedido.PENDIENTE]: [EstadoPedido.CONFIRMADO, EstadoPedido.CANCELADO],
      [EstadoPedido.CONFIRMADO]: [EstadoPedido.PREPARANDO, EstadoPedido.CANCELADO],
      [EstadoPedido.PREPARANDO]: [EstadoPedido.ENVIADO, EstadoPedido.CANCELADO],
      [EstadoPedido.ENVIADO]: [EstadoPedido.ENTREGADO],
      [EstadoPedido.ENTREGADO]: [],
      [EstadoPedido.CANCELADO]: [],
    };

    if (!transicionesValidas[anterior].includes(nuevo)) {
      throw new BadRequestException(
        `No se puede cambiar el estado de ${anterior} a ${nuevo}`,
      );
    }
  }

  private async crearHistorial(
    pedidoId: number,
    estadoAnterior: EstadoPedido | undefined,
    estadoNuevo: EstadoPedido,
    usuarioId: number,
    comentario?: string,
  ): Promise<void> {
    const historial = this.historialRepository.create({
      pedidoId,
      estadoAnterior,
      estadoNuevo,
      usuarioId,
      comentario,
    });

    await this.historialRepository.save(historial);
  }

  private async generarNumeroPedido(): Promise<string> {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');

    const count = await this.pedidosRepository.count();
    const numero = String(count + 1).padStart(5, '0');

    return `PED-${year}${month}-${numero}`;
  }
}