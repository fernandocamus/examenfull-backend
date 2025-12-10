import { Pedido } from "src/pedidos/entities/pedido.entity";
import { Producto } from "src/productos/entities/productos.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('resenas')
export class Resena {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'producto_id' })
    productoId: number;

    @Column({ name: 'usuario_id' })
    usuarioId: number;

    @Column({ name: 'pedido_id' })
    pedidoId: number;

    @Column({ type: 'int', default: 5 })
    calificacion: number;

    @Column({ type: 'text', nullable: true })
    comentario: string;

    @CreateDateColumn({ name: 'fecha_creacion' })
    fechaCreacion: Date;

    @ManyToOne(() => Producto, (producto) => producto.resenas)
    @JoinColumn({ name: 'producto_id' })
    producto: Producto;

    @ManyToOne(() => Usuario, (usuario) => usuario.resenas)
    @JoinColumn({ name: 'usuario_id' })
    usuario: Usuario;

    @ManyToOne(() => Pedido)
    @JoinColumn({ name: 'pedido_id' })
    pedido: Pedido;
}