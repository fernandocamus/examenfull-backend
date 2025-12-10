import { Pedido } from 'src/pedidos/entities/pedido.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn, OneToMany } from 'typeorm';

@Entity('direcciones_envio')
export class DireccionEnvio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'usuario_id' })
  usuarioId: number;

  @Column({ type: 'varchar', length: 50 })
  alias: string;

  @Column({ name: 'nombre_completo', type: 'varchar', length: 100 })
  nombreCompleto: string;

  @Column({ type: 'varchar', length: 20 })
  telefono: string;

  @Column({ type: 'varchar', length: 200 })
  calle: string;

  @Column({ type: 'varchar', length: 20 })
  numero: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  departamento: string;

  @Column({ type: 'varchar', length: 100 })
  ciudad: string;

  @Column({ type: 'varchar', length: 100 })
  region: string;

  @Column({ name: 'codigo_postal', type: 'varchar', length: 10 })
  codigoPostal: string;

  @Column({ type: 'varchar', length: 50, default: 'Chile' })
  pais: string;

  @Column({ name: 'es_principal', type: 'boolean', default: false })
  esPrincipal: boolean;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.direcciones, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToMany(() => Pedido, (pedido) => pedido.direccionEnvio)
  pedidos: Pedido[];
}
