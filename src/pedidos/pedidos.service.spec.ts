import { Test, TestingModule } from '@nestjs/testing';
import { PedidosService } from './pedidos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { HistorialEstadoPedido } from './entities/historial-estado-pedido.entity';
import { ProductosService } from '../productos/productos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto';
import { EstadoPedido } from './entities/pedido.constants';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PedidosService', () => {
    let service: PedidosService;
    let pedidosRepository: Repository<Pedido>;
    let detallesRepository: Repository<DetallePedido>;
    let historialRepository: Repository<HistorialEstadoPedido>;
    let productosService: ProductosService;

    const createMockRepository = () => ({
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        count: jest.fn(),
    });

    const mockPedidosRepository = createMockRepository();
    const mockDetallesRepository = createMockRepository();
    const mockHistorialRepository = createMockRepository();

    const mockProductosService = {
        findOne: jest.fn(),
        descontarStock: jest.fn(),
        devolverStock: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PedidosService,
                {
                    provide: getRepositoryToken(Pedido),
                    useValue: mockPedidosRepository,
                },
                {
                    provide: getRepositoryToken(DetallePedido),
                    useValue: mockDetallesRepository,
                },
                {
                    provide: getRepositoryToken(HistorialEstadoPedido),
                    useValue: mockHistorialRepository,
                },
                {
                    provide: ProductosService,
                    useValue: mockProductosService,
                },
            ],
        }).compile();

        service = module.get<PedidosService>(PedidosService);
        pedidosRepository = module.get<Repository<Pedido>>(getRepositoryToken(Pedido));
        detallesRepository = module.get<Repository<DetallePedido>>(getRepositoryToken(DetallePedido));
        historialRepository = module.get<Repository<HistorialEstadoPedido>>(getRepositoryToken(HistorialEstadoPedido));
        productosService = module.get<ProductosService>(ProductosService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createPedidoDto: CreatePedidoDto = {
            items: [{ productoId: 1, cantidad: 2 }],
            metodoPago: 'CREDITO',
            direccion: 'Calle Test 123',
        } as any;

        const mockProducto = {
            id: 1,
            nombre: 'Producto Test',
            precioBase: 1000,
            iva: 19,
            stockActual: 10,
            activo: true,
        };

        const mockPedidoGuardado = {
            id: 1,
            numeroPedido: 'PED-202412-00001',
            estado: EstadoPedido.PENDIENTE,
            ...createPedidoDto,
        };

        it('debería crear un pedido exitosamente con cálculos correctos', async () => {
            mockProductosService.findOne.mockResolvedValue(mockProducto);
            mockPedidosRepository.count.mockResolvedValue(0);

            mockPedidosRepository.create.mockReturnValue(mockPedidoGuardado);
            mockPedidosRepository.save.mockResolvedValue(mockPedidoGuardado);

            const mockDetalle = { ...createPedidoDto.items[0], pedidoId: 1 };
            mockDetallesRepository.create.mockReturnValue(mockDetalle);
            mockDetallesRepository.save.mockResolvedValue(mockDetalle);

            mockPedidosRepository.findOne.mockResolvedValue(mockPedidoGuardado);

            const result = await service.create(1, createPedidoDto);

            expect(result).toEqual(mockPedidoGuardado);
            expect(mockProductosService.findOne).toHaveBeenCalledWith(1);

            expect(mockDetallesRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                subtotalSinIva: 2000,
                productoId: 1
            }));

            expect(mockPedidosRepository.save).toHaveBeenCalled();
            expect(mockProductosService.descontarStock).toHaveBeenCalledWith(1, 2);
            expect(mockHistorialRepository.save).toHaveBeenCalled();
        });

        it('debería lanzar BadRequestException si el producto no tiene stock', async () => {
            mockProductosService.findOne.mockResolvedValue({
                ...mockProducto,
                stockActual: 1,
            });

            await expect(service.create(1, createPedidoDto)).rejects.toThrow(BadRequestException);
            await expect(service.create(1, createPedidoDto)).rejects.toThrow('Stock insuficiente');
        });

        it('debería lanzar BadRequestException si el producto no está activo', async () => {
            mockProductosService.findOne.mockResolvedValue({
                ...mockProducto,
                activo: false,
            });

            await expect(service.create(1, createPedidoDto)).rejects.toThrow(BadRequestException);
            await expect(service.create(1, createPedidoDto)).rejects.toThrow('no está disponible');
        });
    });

    describe('findAll y busquedas', () => {
        const mockPedidos = [
            { id: 1, estado: EstadoPedido.PENDIENTE },
            { id: 2, estado: EstadoPedido.ENTREGADO },
        ];

        it('findAll debería retornar array de pedidos', async () => {
            mockPedidosRepository.find.mockResolvedValue(mockPedidos);

            const result = await service.findAll();

            expect(result).toEqual(mockPedidos);
            expect(mockPedidosRepository.find).toHaveBeenCalledWith({
                relations: ['usuario'],
                order: { fechaHora: 'DESC' },
            });
        });

        it('findByUser debería filtrar por usuarioId', async () => {
            mockPedidosRepository.find.mockResolvedValue([mockPedidos[0]]);

            const result = await service.findByUser(1);

            expect(result).toHaveLength(1);
            expect(mockPedidosRepository.find).toHaveBeenCalledWith(expect.objectContaining({
                where: { usuarioId: 1 }
            }));
        });

        it('findByEstado debería filtrar por estado', async () => {
            mockPedidosRepository.find.mockResolvedValue([mockPedidos[0]]);

            const result = await service.findByEstado(EstadoPedido.PENDIENTE);

            expect(result).toHaveLength(1);
            expect(mockPedidosRepository.find).toHaveBeenCalledWith(expect.objectContaining({
                where: { estado: EstadoPedido.PENDIENTE }
            }));
        });
    });

    describe('findOne', () => {
        const mockPedido = { id: 1, numeroPedido: 'TEST' };

        it('debería retornar un pedido existente', async () => {
            mockPedidosRepository.findOne.mockResolvedValue(mockPedido);

            const result = await service.findOne(1);

            expect(result).toEqual(mockPedido);
        });

        it('debería lanzar NotFoundException si no existe', async () => {
            mockPedidosRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateEstado', () => {
        const mockPedidoPendiente = {
            id: 1,
            estado: EstadoPedido.PENDIENTE,
            detalles: [{ productoId: 10, cantidad: 5 }],
        };

        const updateDto: UpdateEstadoPedidoDto = {
            estado: EstadoPedido.CONFIRMADO,
            comentario: 'Todo ok',
        };

        beforeEach(() => {
            mockPedidosRepository.findOne.mockResolvedValue(mockPedidoPendiente);
            mockPedidosRepository.save.mockImplementation(a => a);
        });

        it('debería actualizar estado si la transición es válida', async () => {
            const result = await service.updateEstado(1, 1, updateDto);

            expect(mockPedidosRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                estado: EstadoPedido.CONFIRMADO
            }));
            expect(mockHistorialRepository.save).toHaveBeenCalled();
        });

        it('debería lanzar BadRequestException si la transición es inválida', async () => {
            const invalidUpdate = { estado: EstadoPedido.ENTREGADO };

            await expect(service.updateEstado(1, 1, invalidUpdate)).rejects.toThrow(BadRequestException);
            await expect(service.updateEstado(1, 1, invalidUpdate)).rejects.toThrow('No se puede cambiar el estado');
        });

        it('debería devolver stock si se CANCELA el pedido', async () => {
            const cancelUpdate = { estado: EstadoPedido.CANCELADO };

            await service.updateEstado(1, 1, cancelUpdate);

            expect(mockProductosService.devolverStock).toHaveBeenCalledWith(10, 5);
            expect(mockPedidosRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                estado: EstadoPedido.CANCELADO
            }));
        });

    });
});