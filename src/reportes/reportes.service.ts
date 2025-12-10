import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VentaDiaria } from './entities/venta-diaria.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(VentaDiaria)
    private readonly ventasDiariasRepository: Repository<VentaDiaria>,
  ) {}

  async getVentasDiarias(fechaInicio: Date, fechaFin: Date) {
    return await this.ventasDiariasRepository
      .createQueryBuilder('venta')
      .where('venta.fecha >= :fechaInicio', { fechaInicio })
      .andWhere('venta.fecha <= :fechaFin', { fechaFin })
      .orderBy('venta.fecha', 'DESC')
      .getMany();
  }

  async getResumenMensual(year: number, month: number) {
    const ventas = await this.ventasDiariasRepository
      .createQueryBuilder('venta')
      .where('YEAR(venta.fecha) = :year', { year })
      .andWhere('MONTH(venta.fecha) = :month', { month })
      .getMany();

    const totalVendido = ventas.reduce(
      (sum, venta) => sum + Number(venta.totalVendido),
      0,
    );
    const totalPedidos = ventas.reduce(
      (sum, venta) => sum + venta.cantidadPedidos,
      0,
    );

    return {
      year,
      month,
      totalVendido,
      totalPedidos,
      promedio: totalPedidos > 0 ? totalVendido / totalPedidos : 0,
      dias: ventas.length,
    };
  }
}
