import { Test, TestingModule } from '@nestjs/testing';
import { ReportesService } from './reportes.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VentaDiaria } from './entities/venta-diaria.entity';

describe('ReportesService', () => {
    let service: ReportesService;
    let repository: Repository<VentaDiaria>;

    const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
    };

    const mockRepository = {
        createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportesService,
                {
                    provide: getRepositoryToken(VentaDiaria),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<ReportesService>(ReportesService);
        repository = module.get<Repository<VentaDiaria>>(getRepositoryToken(VentaDiaria));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getVentasDiarias', () => {
        it('debería retornar un listado de ventas filtrado por fecha', async () => {
            const fechaInicio = new Date('2024-01-01');
            const fechaFin = new Date('2024-01-31');
            const mockVentas = [{ id: 1, totalVendido: 100 }];

            mockQueryBuilder.getMany.mockResolvedValue(mockVentas);

            const result = await service.getVentasDiarias(fechaInicio, fechaFin);

            expect(result).toEqual(mockVentas);
            expect(repository.createQueryBuilder).toHaveBeenCalledWith('venta');
            expect(mockQueryBuilder.where).toHaveBeenCalledWith(
                'venta.fecha >= :fechaInicio',
                { fechaInicio },
            );
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                'venta.fecha <= :fechaFin',
                { fechaFin },
            );
            expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('venta.fecha', 'DESC');
        });
    });

    describe('getResumenMensual', () => {
        it('debería calcular totales y promedios correctamente', async () => {
            const mockVentas = [
                { totalVendido: 1000, cantidadPedidos: 2 },
                { totalVendido: 2000, cantidadPedidos: 4 },
            ];

            mockQueryBuilder.getMany.mockResolvedValue(mockVentas);

            const result = await service.getResumenMensual(2024, 12);

            expect(result).toEqual({
                year: 2024,
                month: 12,
                totalVendido: 3000,
                totalPedidos: 6,
                promedio: 500,
                dias: 2,
            });

            expect(mockQueryBuilder.where).toHaveBeenCalledWith(
                'YEAR(venta.fecha) = :year',
                { year: 2024 },
            );
            expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
                'MONTH(venta.fecha) = :month',
                { month: 12 },
            );
        });

        it('debería manejar el caso de 0 ventas para evitar división por cero', async () => {
            mockQueryBuilder.getMany.mockResolvedValue([]);

            const result = await service.getResumenMensual(2024, 1);

            expect(result).toEqual({
                year: 2024,
                month: 1,
                totalVendido: 0,
                totalPedidos: 0,
                promedio: 0,
                dias: 0,
            });
        });

        it('debería convertir strings numéricos en totalVendido correctamente', async () => {
            const mockVentas = [
                { totalVendido: '100.50', cantidadPedidos: 1 },
                { totalVendido: '200.50', cantidadPedidos: 1 },
            ];

            mockQueryBuilder.getMany.mockResolvedValue(mockVentas);

            const result = await service.getResumenMensual(2024, 5);

            expect(result.totalVendido).toBe(301);
        });
    });
});