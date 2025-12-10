import { CarritoItem } from 'src/carrito/entities/carrito-item.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';
import { DetallePedido } from 'src/pedidos/entities/detalle-pedido.entity';
import { Resena } from 'src/resenas/entities/resena.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn,} from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ name: 'precio_base', type: 'decimal', precision: 10, scale: 2 })
  precioBase: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 19 })
  iva: number;

  @Column({ name: 'precio_con_iva', type: 'decimal', precision: 10, scale: 2 })
  precioConIva: number;

  @Column({ name: 'stock_actual', type: 'int', default: 0 })
  stockActual: number;

  @Column({ name: 'stock_minimo', type: 'int', default: 5 })
  stockMinimo: number;

  @Column({ name: 'categoria_id' })
  categoriaId: number;

  @Column({ name: 'ruta_imagen', type: 'varchar', length: 255, nullable: true })
  rutaImagen: string;

  @Column({ name: 'imagenes_adicionales', type: 'json', nullable: true })
  imagenesAdicionales: string[];

  @Column({ type: 'boolean', default: false })
  destacado: boolean;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  peso: number;

  @Column({ type: 'json', nullable: true })
  dimensiones: { largo: number; ancho: number; alto: number };

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion' })
  fechaActualizacion: Date;

  @ManyToOne(() => Categoria, (categoria) => categoria.productos)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @OneToMany(() => DetallePedido, (detalle) => detalle.producto)
  detallesPedido: DetallePedido[];

  @OneToMany(() => CarritoItem, (item) => item.producto)
  itemsCarrito: CarritoItem[];

  @OneToMany(() => Resena, (resena) => resena.producto)
  resenas: Resena[];
}
