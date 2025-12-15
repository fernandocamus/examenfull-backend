import { Test, TestingModule } from '@nestjs/testing';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { RolesGuard } from '../auth/guard/roles.guard';
import { RolUsuario } from '../usuarios/entities/usuario.entity';

describe('ReportesController', () => {
    let controller: ReportesController;
    let service: ReportesService;

    const mockReportesService = {
        getVentasDiarias: jest.fn(),
        getResumenMensual: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReportesController],
            providers: [
                {
                    provide: ReportesService,
                    useValue: mockReportesService,
                },
            ],
        })
            .overrideGuard(RolesGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<ReportesController>(ReportesController);
        service = module.get<ReportesService>(ReportesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getVentasDiarias', () => {
        it('debería convertir los strings a Date y llamar al servicio', async () => {
            const fechaInicioStr = '2024-01-01';
            const fechaFinStr = '2024-01-31';
            const mockResult = [{ fecha: new Date(), total: 100 }];

            mockReportesService.getVentasDiarias.mockResolvedValue(mockResult);

            const result = await controller.getVentasDiarias(fechaInicioStr, fechaFinStr);

            expect(result).toEqual(mockResult);
            expect(mockReportesService.getVentasDiarias).toHaveBeenCalledWith(
                expect.any(Date),
                expect.any(Date),
            );

            const calledArgs = mockReportesService.getVentasDiarias.mock.calls[0];
            expect(calledArgs[0].toISOString()).toContain('2024-01-01');
        });
    });

    describe('getResumenMensual', () => {
        it('debería obtener el resumen mensual pasando año y mes', async () => {
            const year = 2024;
            const month = 12;
            const mockResumen = { totalVendido: 1000, promedio: 100 };

            mockReportesService.getResumenMensual.mockResolvedValue(mockResumen);

            const result = await controller.getResumenMensual(year, month);

            expect(result).toEqual(mockResumen);
            expect(mockReportesService.getResumenMensual).toHaveBeenCalledWith(year, month);
        });
    });

    describe('Decoradores y Seguridad', () => {
        it('debería estar protegido por RolesGuard', () => {
            const guards = Reflect.getMetadata('__guards__', ReportesController);
            expect(guards).toBeDefined();
            expect(guards[0]).toBe(RolesGuard);
        });

        it('debería requerir rol ADMIN', () => {
            const roles = Reflect.getMetadata('roles', ReportesController);
            expect(roles).toContain(RolUsuario.ADMIN);
        });
    });
});