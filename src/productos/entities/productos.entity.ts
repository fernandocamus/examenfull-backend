import { CarritoItem } from '../../carrito/entities/carrito-item.entity';
import { Categoria } from '../../categorias/entities/categoria.entity';
import { DetallePedido } from '../../pedidos/entities/detalle-pedido.entity';
import { Resena } from '../../resenas/entities/resena.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn,} from 'typeorm';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ name: 'precio_base', type: 'int'})
  precioBase: number;

  @Column({ type: 'decimal', default: 19 })
  iva: number;

  @Column({ name: 'precio_con_iva', type: 'decimal', precision: 10, scale: 2 })
  precioConIva: number;

  @Column({ name: 'stock_actual', type: 'int', default: 0 })
  stockActual: number;

  @Column({ name: 'stock_minimo', type: 'int', default: 5 })
  stockMinimo: number;

  @Column({ name: 'categoria_id' })
  categoriaId: number;

  @Column({ nullable: true })
  rutaImagen?: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

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
