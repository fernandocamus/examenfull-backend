import { Controller, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolUsuario } from '../usuarios/entities/usuario.entity';

@Controller('reportes')
@UseGuards(RolesGuard)
@Roles(RolUsuario.ADMIN)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('ventas-diarias')
  getVentasDiarias(
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.reportesService.getVentasDiarias(
      new Date(fechaInicio),
      new Date(fechaFin),
    );
  }

  @Get('resumen-mensual')
  getResumenMensual(
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.reportesService.getResumenMensual(year, month);
  }
}
