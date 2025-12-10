import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('metodos_envio')
export class MetodoEnvio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  costo: number;

  @Column({ name: 'tiempo_estimado', type: 'varchar', length: 100, nullable: true })
  tiempoEstimado: string;

  @Column({ type: 'boolean', default: true })
  activo: boolean;
}