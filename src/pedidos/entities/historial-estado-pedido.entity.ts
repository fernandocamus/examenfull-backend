// src/pedidos/entities/historial-estado-pedido.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity'; // Solo importamos Pedido, NO el Enum
import { EstadoPedido } from './pedido.constants'; // El Enum viene de aquí
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('historial_estado_pedidos')
export class HistorialEstadoPedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'pedido_id' })
  pedidoId: number;

  @Column({
    name: 'estado_anterior',
    type: 'enum',
    enum: EstadoPedido,
    nullable: true,
  })
  estadoAnterior: EstadoPedido;

  @Column({
    name: 'estado_nuevo',
    type: 'enum',
    enum: EstadoPedido,
  })
  estadoNuevo: EstadoPedido;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId: number;

  @Column({ type: 'text', nullable: true })
  comentario: string;

  @CreateDateColumn({ name: 'fecha_cambio' })
  fechaCambio: Date;

  @ManyToOne(() => Pedido, (pedido) => pedido.historialEstados, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Pedido;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}