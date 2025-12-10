import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { DetallePedido } from './detalle-pedido.entity';
import { HistorialEstadoPedido } from './historial-estado-pedido.entity';
import { EstadoPedido, MetodoPago } from './pedido.constants';

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'numero_pedido', type: 'varchar', length: 50, unique: true })
  numeroPedido: string;

  @CreateDateColumn({ name: 'fecha_hora' })
  fechaHora: Date;

  @Column({
    type: 'enum',
    enum: EstadoPedido,
    default: EstadoPedido.PENDIENTE,
  })
  estado: EstadoPedido;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'total_iva', type: 'decimal', precision: 10, scale: 2 })
  totalIva: number;

  @Column({ name: 'costo_envio', type: 'decimal', precision: 10, scale: 2, default: 0 })
  costoEnvio: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({
    name: 'metodo_pago',
    type: 'enum',
    enum: MetodoPago,
    default: MetodoPago.TRANSFERENCIA,
  })
  metodoPago: MetodoPago;

  @Column({ name: 'notas_cliente', type: 'text', nullable: true })
  notasCliente: string;

  @Column({ name: 'notas_admin', type: 'text', nullable: true })
  notasAdmin: string;

  @Column({ name: 'fecha_confirmacion', type: 'datetime', nullable: true })
  fechaConfirmacion: Date;

  @Column({ name: 'fecha_envio', type: 'datetime', nullable: true })
  fechaEnvio: Date;

  @Column({ name: 'fecha_entrega', type: 'datetime', nullable: true })
  fechaEntrega: Date;

  @Column({ name: 'numero_seguimiento', type: 'varchar', length: 100, nullable: true })
  numeroSeguimiento: string;

  @Column({ name: 'nombre_destinatario', type: 'varchar', length: 100 })
  nombreDestinatario: string;

  @Column({ type: 'varchar', length: 20 })
  telefono: string;

  @Column({ type: 'varchar', length: 300 })
  direccion: string;

  @Column({ type: 'varchar', length: 100 })
  ciudad: string;

  @Column({ type: 'varchar', length: 100 })
  region: string;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.pedidos)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => DetallePedido, (detalle) => detalle.pedido, {
    cascade: true,
    eager: true,
  })
  detalles: DetallePedido[];

  @OneToMany(() => HistorialEstadoPedido, (historial) => historial.pedido, {
    cascade: true,
  })
  historialEstados: HistorialEstadoPedido[];
}