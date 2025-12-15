import { Producto } from '../../productos/entities/productos.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';

@Entity('carrito')
export class CarritoItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @Column({ name: 'producto_id' })
  productoId: number;

  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @CreateDateColumn({ name: 'fecha_agregado' })
  fechaAgregado: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.carrito, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Producto, (producto) => producto.itemsCarrito, {
    eager: true,
  })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;
}
