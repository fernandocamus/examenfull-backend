import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/productos.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const { precioBase, iva = 19 } = createProductoDto;

    const precioConIva = Number((precioBase * (1 + iva / 100)).toFixed(2));

    const producto = this.productosRepository.create({
      ...createProductoDto,
      iva,
      precioConIva,
    });

    return await this.productosRepository.save(producto);
  }

  async findAll(): Promise<Producto[]> {
    return await this.productosRepository.find({
      relations: ['categoria'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Producto> {
    const producto = await this.productosRepository.findOne({
      where: { id },
      relations: ['categoria', 'resenas', 'resenas.usuario'],
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return producto;
  }

  async update(id: number, updateProductoDto: UpdateProductoDto): Promise<Producto> {
    const producto = await this.findOne(id);

    Object.assign(producto, updateProductoDto);

    if (updateProductoDto.precioBase !== undefined || updateProductoDto.iva !== undefined) {
      const precioBase = producto.precioBase;
      const iva = producto.iva;
      producto.precioConIva = Number((precioBase * (1 + iva / 100)).toFixed(2));
    }

    return await this.productosRepository.save(producto);
  }

  async remove(id: number): Promise<void> {
    const producto = await this.findOne(id);
    await this.productosRepository.remove(producto);
  }

  async verificarStock(id: number, cantidad: number): Promise<boolean> {
    const producto = await this.findOne(id);
    return producto.stockActual >= cantidad;
  }

  async descontarStock(id: number, cantidad: number): Promise<void> {
    const producto = await this.findOne(id);

    if (producto.stockActual < cantidad) {
      throw new BadRequestException(
        `Stock insuficiente para el producto ${producto.nombre}`,
      );
    }

    producto.stockActual -= cantidad;
    await this.productosRepository.save(producto);
  }

  async devolverStock(id: number, cantidad: number): Promise<void> {
    const producto = await this.findOne(id);
    producto.stockActual += cantidad;
    await this.productosRepository.save(producto);
  }
}
