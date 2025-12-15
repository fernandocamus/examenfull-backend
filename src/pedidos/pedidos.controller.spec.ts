import { Test, TestingModule } from '@nestjs/testing';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdateEstadoPedidoDto } from './dto/update-estado-pedido.dto';
import { EstadoPedido } from './entities/pedido.constants';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PedidosController', () => {
    let controller: PedidosController;
    let service: PedidosService;

    const mockPedidosService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findByEstado: jest.fn(),
        findByUser: jest.fn(),
        findOne: jest.fn(),
        updateEstado: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PedidosController],
            providers: [
                {
                    provide: PedidosService,
                    useValue: mockPedidosService,
                },
            ],
        }).compile();

        controller = module.get<PedidosController>(PedidosController);
        service = module.get<PedidosService>(PedidosService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        const createDto: CreatePedidoDto = {
            items: [{ productoId: 1, cantidad: 2 }],
            direccionEntrega: 'Calle Falsa 123'
        } as any;

        const mockResponse = {
            id: 1,
            numeroPedido: 'PED-202412-00001',
            estado: 'PENDIENTE',
            total: 1190000,
            fechaHora: '2024-12-07T10:30:00.000Z'
        };

        it('debería crear un pedido usando el ID del header x-user-id', async () => {
            mockPedidosService.create.mockResolvedValue(mockResponse);

            const result = await controller.create('5', createDto);

            expect(result).toEqual(mockResponse);
            expect(mockPedidosService.create).toHaveBeenCalledWith(5, createDto);
        });

        it('debería usar ID 1 por defecto si no se envía el header', async () => {
            mockPedidosService.create.mockResolvedValue(mockResponse);

            const result = await controller.create(undefined as any, createDto);

            expect(mockPedidosService.create).toHaveBeenCalledWith(1, createDto);
        });

        it('debería propagar errores del servicio (ej. stock insuficiente)', async () => {
            mockPedidosService.create.mockRejectedValue(
                new BadRequestException('Stock insuficiente'),
            );

            await expect(controller.create('1', createDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('findAll', () => {
        const mockPedidos = [
            { id: 1, estado: EstadoPedido.PENDIENTE },
            { id: 2, estado: EstadoPedido.ENTREGADO },
        ];

        it('debería retornar todos los pedidos si no hay filtro', async () => {
            mockPedidosService.findAll.mockResolvedValue(mockPedidos);

            const result = await controller.findAll();

            expect(result).toEqual(mockPedidos);
            expect(mockPedidosService.findAll).toHaveBeenCalled();
            expect(mockPedidosService.findByEstado).not.toHaveBeenCalled();
        });

        it('debería filtrar por estado si se provee el query param', async () => {
            const pedidosPendientes = [mockPedidos[0]];
            mockPedidosService.findByEstado.mockResolvedValue(pedidosPendientes);

            const result = await controller.findAll(EstadoPedido.PENDIENTE);

            expect(result).toEqual(pedidosPendientes);
            expect(mockPedidosService.findByEstado).toHaveBeenCalledWith(EstadoPedido.PENDIENTE);
            expect(mockPedidosService.findAll).not.toHaveBeenCalled();
        });
    });

    describe('findByUser', () => {
        const mockPedidosUsuario = [
            { id: 1, usuarioId: 5, total: 5000 },
        ];

        it('debería retornar los pedidos del usuario especificado en header', async () => {
            mockPedidosService.findByUser.mockResolvedValue(mockPedidosUsuario);

            const result = await controller.findByUser('5');

            expect(result).toEqual(mockPedidosUsuario);
            expect(mockPedidosService.findByUser).toHaveBeenCalledWith(5);
        });

        it('debería usar ID 1 por defecto si falta el header', async () => {
            mockPedidosService.findByUser.mockResolvedValue(mockPedidosUsuario);

            await controller.findByUser(undefined as any);

            expect(mockPedidosService.findByUser).toHaveBeenCalledWith(1);
        });
    });

    describe('findOne', () => {
        const mockPedido = { id: 1, numeroPedido: 'PED-001' };

        it('debería retornar un pedido por ID', async () => {
            mockPedidosService.findOne.mockResolvedValue(mockPedido);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockPedido);
            expect(mockPedidosService.findOne).toHaveBeenCalledWith(1);
        });

        it('debería propagar NotFoundException si el pedido no existe', async () => {
            mockPedidosService.findOne.mockRejectedValue(
                new NotFoundException('Pedido no encontrado'),
            );

            await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateEstado', () => {
        const updateDto: UpdateEstadoPedidoDto = {
            estado: EstadoPedido.ENVIADO,
        } as any;

        const mockResponse = { success: true, message: 'Estado actualizado' };

        it('debería actualizar el estado correctamente', async () => {
            mockPedidosService.updateEstado.mockResolvedValue(mockResponse);

            const result = await controller.updateEstado(1, '5', updateDto);

            expect(result).toEqual(mockResponse);
            expect(mockPedidosService.updateEstado).toHaveBeenCalledWith(1, 5, updateDto);
        });

        it('debería usar ID de usuario 1 por defecto en update', async () => {
            mockPedidosService.updateEstado.mockResolvedValue(mockResponse);

            await controller.updateEstado(1, undefined as any, updateDto);

            expect(mockPedidosService.updateEstado).toHaveBeenCalledWith(1, 1, updateDto);
        });

        it('debería propagar errores de validación de estado', async () => {
            mockPedidosService.updateEstado.mockRejectedValue(
                new BadRequestException('Transición de estado no válida'),
            );

            await expect(controller.updateEstado(1, '1', updateDto)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('Decoradores y Rutas', () => {
        it('debería estar decorado con @Controller("pedidos")', () => {
            const metadata = Reflect.getMetadata('path', PedidosController);
            expect(metadata).toBe('pedidos');
        });
    });
});