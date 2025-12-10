import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarritoItem } from './entities/carrito-item.entity';
import { AddToCarritoDto } from './dto/agregar-carrito.dto';
import { UpdateCarritoItemDto } from './dto/update-carrito-item.dto';
import { ProductosService } from '../productos/productos.service';

@Injectable()
export class CarritoService {
  constructor(
    @InjectRepository(CarritoItem)
    private readonly carritoRepository: Repository<CarritoItem>,
    private readonly productosService: ProductosService,
  ) {}

  async addItem(
    usuarioId: number,
    addToCarritoDto: AddToCarritoDto,
  ): Promise<CarritoItem> {
    const { productoId, cantidad } = addToCarritoDto;

    const producto = await this.productosService.findOne(productoId);

    if (!producto.activo) {
      throw new BadRequestException('El producto no está disponible');
    }

    if (producto.stockActual < cantidad) {
      throw new BadRequestException('Stock insuficiente');
    }

    const itemExistente = await this.carritoRepository.findOne({
      where: { usuarioId, productoId },
    });

    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;

      if (producto.stockActual < nuevaCantidad) {
        throw new BadRequestException('Stock insuficiente');
      }

      itemExistente.cantidad = nuevaCantidad;
      return await this.carritoRepository.save(itemExistente);
    }

    const item = this.carritoRepository.create({
      usuarioId,
      productoId,
      cantidad,
    });

    return await this.carritoRepository.save(item);
  }

  async getCarrito(usuarioId: number): Promise<any> {
    const items = await this.carritoRepository.find({
      where: { usuarioId },
      order: { fechaAgregado: 'DESC' },
    });

    let subtotal = 0;
    let totalIva = 0;

    const itemsConPrecio = items.map((item) => {
      const subtotalItem =
        Number(item.producto.precioBase) * item.cantidad;
      const ivaItem =
        subtotalItem * (Number(item.producto.iva) / 100);
      const totalItem = subtotalItem + ivaItem;

      subtotal += subtotalItem;
      totalIva += ivaItem;

      return {
        ...item,
        subtotalItem: Number(subtotalItem.toFixed(2)),
        ivaItem: Number(ivaItem.toFixed(2)),
        totalItem: Number(totalItem.toFixed(2)),
      };
    });

    const total = subtotal + totalIva;

    return {
      items: itemsConPrecio,
      resumen: {
        cantidadItems: items.length,
        cantidadProductos: items.reduce((sum, item) => sum + item.cantidad, 0),
        subtotal: Number(subtotal.toFixed(2)),
        totalIva: Number(totalIva.toFixed(2)),
        total: Number(total.toFixed(2)),
      },
    };
  }

  async updateItem(
    id: number,
    usuarioId: number,
    updateCarritoItemDto: UpdateCarritoItemDto,
  ): Promise<CarritoItem> {
    const item = await this.carritoRepository.findOne({
      where: { id, usuarioId },
    });

    if (!item) {
      throw new NotFoundException('Item del carrito no encontrado');
    }

    const producto = await this.productosService.findOne(item.productoId);

    if (producto.stockActual < updateCarritoItemDto.cantidad) {
      throw new BadRequestException('Stock insuficiente');
    }

    item.cantidad = updateCarritoItemDto.cantidad;
    return await this.carritoRepository.save(item);
  }

  async removeItem(id: number, usuarioId: number): Promise<void> {
    const item = await this.carritoRepository.findOne({
      where: { id, usuarioId },
    });

    if (!item) {
      throw new NotFoundException('Item del carrito no encontrado');
    }

    await this.carritoRepository.remove(item);
  }

  async clearCarrito(usuarioId: number): Promise<void> {
    await this.carritoRepository.delete({ usuarioId });
  }
}
