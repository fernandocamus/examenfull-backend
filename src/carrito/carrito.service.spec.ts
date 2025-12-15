import { Test, TestingModule } from '@nestjs/testing';
import { CarritoService } from './carrito.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarritoItem } from './entities/carrito-item.entity';
import { ProductosService } from '../productos/productos.service';
import { AddToCarritoDto } from './dto/agregar-carrito.dto';
import { UpdateCarritoItemDto } from './dto/update-carrito-item.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CarritoService', () => {
    let service: CarritoService;
    let repository: Repository<CarritoItem>;
    let productosService: ProductosService;

    const mockCarritoRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        remove: jest.fn(),
        delete: jest.fn(),
    };

    const mockProductosService = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CarritoService,
                {
                    provide: getRepositoryToken(CarritoItem),
                    useValue: mockCarritoRepository,
                },
                {
                    provide: ProductosService,
                    useValue: mockProductosService,
                },
            ],
        }).compile();

        service = module.get<CarritoService>(CarritoService);
        repository = module.get<Repository<CarritoItem>>(getRepositoryToken(CarritoItem));
        productosService = module.get<ProductosService>(ProductosService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('addItem', () => {
        const addToCarritoDto: AddToCarritoDto = {
            productoId: 1,
            cantidad: 2,
        };

        const mockProducto = {
            id: 1,
            nombre: 'Producto Test',
            precioBase: 1000,
            stockActual: 10,
            activo: true,
        };

        it('debería agregar un nuevo item al carrito si no existe', async () => {
            mockProductosService.findOne.mockResolvedValue(mockProducto);
            mockCarritoRepository.findOne.mockResolvedValue(null);

            const newItem = { ...addToCarritoDto, usuarioId: 1, id: 1 };
            mockCarritoRepository.create.mockReturnValue(newItem);
            mockCarritoRepository.save.mockResolvedValue(newItem);

            const result = await service.addItem(1, addToCarritoDto);

            expect(result).toEqual(newItem);
            expect(mockCarritoRepository.create).toHaveBeenCalledWith({
                usuarioId: 1,
                productoId: 1,
                cantidad: 2,
            });
            expect(mockCarritoRepository.save).toHaveBeenCalled();
        });

        it('debería sumar cantidad si el item ya existe', async () => {
            mockProductosService.findOne.mockResolvedValue(mockProducto);

            const existingItem = { id: 5, usuarioId: 1, productoId: 1, cantidad: 3 };
            mockCarritoRepository.findOne.mockResolvedValue(existingItem);
            mockCarritoRepository.save.mockImplementation(item => Promise.resolve(item));

            const result = await service.addItem(1, addToCarritoDto);

            expect(result.cantidad).toBe(5);
            expect(mockCarritoRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                cantidad: 5
            }));
        });

        it('debería lanzar BadRequestException si el producto no está activo', async () => {
            mockProductosService.findOne.mockResolvedValue({ ...mockProducto, activo: false });

            await expect(service.addItem(1, addToCarritoDto)).rejects.toThrow(BadRequestException);
            await expect(service.addItem(1, addToCarritoDto)).rejects.toThrow('no está disponible');
        });

        it('debería lanzar BadRequestException si no hay stock suficiente (nuevo item)', async () => {
            mockProductosService.findOne.mockResolvedValue({ ...mockProducto, stockActual: 1 });

            await expect(service.addItem(1, addToCarritoDto)).rejects.toThrow(BadRequestException);
            await expect(service.addItem(1, addToCarritoDto)).rejects.toThrow('Stock insuficiente');
        });

        it('debería lanzar BadRequestException si la suma supera el stock (item existente)', async () => {
            mockProductosService.findOne.mockResolvedValue({ ...mockProducto, stockActual: 4 });

            const existingItem = { id: 5, usuarioId: 1, productoId: 1, cantidad: 3 };
            mockCarritoRepository.findOne.mockResolvedValue(existingItem);

            await expect(service.addItem(1, addToCarritoDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('getCarrito', () => {
        it('debería retornar el carrito con cálculos correctos', async () => {
            const mockItems = [
                {
                    id: 1,
                    usuarioId: 1,
                    cantidad: 2,
                    producto: { id: 10, precioBase: 1000, iva: 19 },
                },
            ];

            mockCarritoRepository.find.mockResolvedValue(mockItems);

            const result = await service.getCarrito(1);

            expect(result.items[0].subtotalItem).toBe(2000);
            expect(result.items[0].ivaItem).toBe(380);
            expect(result.items[0].totalItem).toBe(2380);

            expect(result.resumen.subtotal).toBe(2000);
            expect(result.resumen.totalIva).toBe(380);
            expect(result.resumen.total).toBe(2380);
            expect(result.resumen.cantidadItems).toBe(1);
        });

        it('debería retornar resumen en 0 si el carrito está vacío', async () => {
            mockCarritoRepository.find.mockResolvedValue([]);

            const result = await service.getCarrito(1);

            expect(result.items).toHaveLength(0);
            expect(result.resumen.total).toBe(0);
        });
    });

    describe('updateItem', () => {
        const updateDto: UpdateCarritoItemDto = { cantidad: 5 };
        const mockItem = { id: 1, usuarioId: 1, productoId: 10, cantidad: 1 };
        const mockProducto = { id: 10, stockActual: 20 };

        it('debería actualizar la cantidad exitosamente', async () => {
            mockCarritoRepository.findOne.mockResolvedValue(mockItem);
            mockProductosService.findOne.mockResolvedValue(mockProducto);
            mockCarritoRepository.save.mockResolvedValue({ ...mockItem, cantidad: 5 });

            const result = await service.updateItem(1, 1, updateDto);

            expect(result.cantidad).toBe(5);
            expect(mockCarritoRepository.save).toHaveBeenCalled();
        });

        it('debería lanzar NotFoundException si el item no existe', async () => {
            mockCarritoRepository.findOne.mockResolvedValue(null);

            await expect(service.updateItem(99, 1, updateDto)).rejects.toThrow(NotFoundException);
        });

        it('debería lanzar BadRequestException si el stock es insuficiente', async () => {
            mockCarritoRepository.findOne.mockResolvedValue(mockItem);
            mockProductosService.findOne.mockResolvedValue({ ...mockProducto, stockActual: 4 }); 

            await expect(service.updateItem(1, 1, updateDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('removeItem', () => {
        it('debería eliminar el item si existe', async () => {
            const mockItem = { id: 1, usuarioId: 1 };
            mockCarritoRepository.findOne.mockResolvedValue(mockItem);
            mockCarritoRepository.remove.mockResolvedValue(mockItem);

            await service.removeItem(1, 1);

            expect(mockCarritoRepository.remove).toHaveBeenCalledWith(mockItem);
        });

        it('debería lanzar NotFoundException si el item no existe', async () => {
            mockCarritoRepository.findOne.mockResolvedValue(null);

            await expect(service.removeItem(99, 1)).rejects.toThrow(NotFoundException);
        });
    });

    describe('clearCarrito', () => {
        it('debería eliminar todos los items del usuario', async () => {
            mockCarritoRepository.delete.mockResolvedValue({ affected: 5 });

            await service.clearCarrito(1);

            expect(mockCarritoRepository.delete).toHaveBeenCalledWith({ usuarioId: 1 });
        });
    });
});