import { Producto } from "../../productos/entities/productos.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('ventas_diarias')
export class VentaDiaria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', unique: true })
  fecha: Date;

  @Column({ name: 'cantidad_pedidos', type: 'int', default: 0 })
  cantidadPedidos: number;

  @Column({ name: 'total_vendido', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalVendido: number;

  @Column({ name: 'total_productos_vendidos', type: 'int', default: 0 })
  totalProductosVendidos: number;

  @Column({ name: 'producto_mas_vendido_id', nullable: true })
  productoMasVendidoId: number;

  @Column({ name: 'promedio_ticket', type: 'decimal', precision: 10, scale: 2, default: 0 })
  promedioTicket: number;

  @Column({ name: 'pedidos_pendientes', type: 'int', default: 0 })
  pedidosPendientes: number;

  @Column({ name: 'pedidos_completados', type: 'int', default: 0 })
  pedidosCompletados: number;

  @ManyToOne(() => Producto, { nullable: true })
  @JoinColumn({ name: 'producto_mas_vendido_id' })
  productoMasVendido: Producto;
}