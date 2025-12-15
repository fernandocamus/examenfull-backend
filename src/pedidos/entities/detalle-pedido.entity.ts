import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pedido } from "./pedido.entity";
import { Producto } from "../../productos/entities/productos.entity";

@Entity('detalle_pedido')
export class DetallePedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pedido_id' })
  pedidoId: number;

  @Column({ name: 'producto_id' })
  productoId: number;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ name: 'precio_unitario_base', type: 'decimal', precision: 10, scale: 2 })
  precioUnitarioBase: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  iva: number;

  @Column({ name: 'precio_unitario_con_iva', type: 'decimal', precision: 10, scale: 2 })
  precioUnitarioConIva: number;

  @Column({ name: 'subtotal_sin_iva', type: 'decimal', precision: 10, scale: 2 })
  subtotalSinIva: number;

  @Column({ name: 'subtotal_iva', type: 'decimal', precision: 10, scale: 2 })
  subtotalIva: number;

  @Column({ name: 'subtotal_con_iva', type: 'decimal', precision: 10, scale: 2 })
  subtotalConIva: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;

  @ManyToOne(() => Producto, (producto) => producto.detallesPedido, { eager: true })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;
}