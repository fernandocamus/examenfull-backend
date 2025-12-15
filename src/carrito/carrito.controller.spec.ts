import { Test, TestingModule } from '@nestjs/testing';
import { CarritoController } from './carrito.controller';
import { CarritoService } from './carrito.service';
import { AddToCarritoDto } from './dto/agregar-carrito.dto';
import { UpdateCarritoItemDto } from './dto/update-carrito-item.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CarritoController', () => {
    let controller: CarritoController;
    let service: CarritoService;

    const mockCarritoService = {
        addItem: jest.fn(),
        getCarrito: jest.fn(),
        updateItem: jest.fn(),
        removeItem: jest.fn(),
        clearCarrito: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CarritoController],
            providers: [
                {
                    provide: CarritoService,
                    useValue: mockCarritoService,
                },
            ],
        }).compile();

        controller = module.get<CarritoController>(CarritoController);
        service = module.get<CarritoService>(CarritoService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('addItem', () => {
        const addToCarritoDto: AddToCarritoDto = {
            productoId: 1,
            cantidad: 2,
        };

        const mockItem = {
            id: 1,
            usuarioId: 1,
            ...addToCarritoDto,
        };

        it('debería agregar un item al carrito exitosamente', async () => {
            mockCarritoService.addItem.mockResolvedValue(mockItem);

            const result = await controller.addItem(1, addToCarritoDto);

            expect(result).toEqual(mockItem);
            expect(mockCarritoService.addItem).toHaveBeenCalledWith(1, addToCarritoDto);
        });

        it('debería propagar errores (ej. stock insuficiente)', async () => {
            mockCarritoService.addItem.mockRejectedValue(
                new BadRequestException('Stock insuficiente'),
            );

            await expect(controller.addItem(1, addToCarritoDto)).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('getCarrito', () => {
        const mockCarritoResponse = {
            items: [],
            resumen: { total: 1000 },
        };

        it('debería obtener el carrito del usuario', async () => {
            mockCarritoService.getCarrito.mockResolvedValue(mockCarritoResponse);

            const result = await controller.getCarrito(1);

            expect(result).toEqual(mockCarritoResponse);
            expect(mockCarritoService.getCarrito).toHaveBeenCalledWith(1);
        });
    });

    describe('updateItem', () => {
        const updateDto: UpdateCarritoItemDto = { cantidad: 5 };
        const mockItemActualizado = { id: 1, cantidad: 5 };

        it('debería actualizar la cantidad de un item', async () => {
            mockCarritoService.updateItem.mockResolvedValue(mockItemActualizado);

            const result = await controller.updateItem(1, 10, updateDto);

            expect(result).toEqual(mockItemActualizado);
            expect(mockCarritoService.updateItem).toHaveBeenCalledWith(10, 1, updateDto);
        });

        it('debería propagar errores si el item no existe', async () => {
            mockCarritoService.updateItem.mockRejectedValue(
                new NotFoundException('Item no encontrado'),
            );

            await expect(controller.updateItem(1, 10, updateDto)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('removeItem', () => {
        it('debería eliminar un item del carrito', async () => {
            mockCarritoService.removeItem.mockResolvedValue(undefined);

            await controller.removeItem(1, 10);

            expect(mockCarritoService.removeItem).toHaveBeenCalledWith(10, 1);
        });

        it('debería propagar excepciones si falla', async () => {
            mockCarritoService.removeItem.mockRejectedValue(new Error('Error DB'));

            await expect(controller.removeItem(1, 10)).rejects.toThrow('Error DB');
        });
    });

    describe('clearCarrito', () => {
        it('debería vaciar el carrito del usuario', async () => {
            mockCarritoService.clearCarrito.mockResolvedValue(undefined);

            await controller.clearCarrito(1);

            expect(mockCarritoService.clearCarrito).toHaveBeenCalledWith(1);
        });
    });

    describe('Decoradores', () => {
        it('debería estar decorado con @Controller("carrito")', () => {
            const metadata = Reflect.getMetadata('path', CarritoController);
            expect(metadata).toBe('carrito');
        });
    });
});