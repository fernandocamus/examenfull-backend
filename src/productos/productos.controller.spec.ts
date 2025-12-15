import { Test, TestingModule } from '@nestjs/testing';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductosController', () => {
    let controller: ProductosController;
    let service: ProductosService;

    const mockProductosService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProductosController],
            providers: [
                {
                    provide: ProductosService,
                    useValue: mockProductosService,
                },
            ],
        }).compile();

        controller = module.get<ProductosController>(ProductosController);
        service = module.get<ProductosService>(ProductosService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        const createDto: CreateProductoDto = {
            nombre: 'Producto Test',
            precioBase: 1000,
            stockActual: 10,
            categoriaId: 1,
        } as any;

        it('debería crear un producto exitosamente', async () => {
            const resultDto = { id: 1, ...createDto, precioConIva: 1190 };
            mockProductosService.create.mockResolvedValue(resultDto);

            const result = await controller.create(createDto);

            expect(result).toEqual(resultDto);
            expect(mockProductosService.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe('findAll', () => {
        it('debería retornar todos los productos', async () => {
            const mockProductos = [{ id: 1, nombre: 'Producto 1' }];
            mockProductosService.findAll.mockResolvedValue(mockProductos);

            const result = await controller.findAll();

            expect(result).toEqual(mockProductos);
            expect(mockProductosService.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('debería retornar un producto por ID', async () => {
            const mockProducto = { id: 1, nombre: 'Producto 1' };
            mockProductosService.findOne.mockResolvedValue(mockProducto);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockProducto);
            expect(mockProductosService.findOne).toHaveBeenCalledWith(1);
        });

        it('debería propagar NotFoundException si no existe', async () => {
            mockProductosService.findOne.mockRejectedValue(
                new NotFoundException('Producto no encontrado'),
            );

            await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        const updateDto: UpdateProductoDto = { precioBase: 2000 } as any;

        it('debería actualizar un producto exitosamente', async () => {
            const mockUpdated = { id: 1, nombre: 'Producto 1', precioBase: 2000 };
            mockProductosService.update.mockResolvedValue(mockUpdated);

            const result = await controller.update(1, updateDto);

            expect(result).toEqual(mockUpdated);
            expect(mockProductosService.update).toHaveBeenCalledWith(1, updateDto);
        });
    });

    describe('remove', () => {
        it('debería eliminar un producto', async () => {
            mockProductosService.remove.mockResolvedValue(undefined);

            await controller.remove(1);

            expect(mockProductosService.remove).toHaveBeenCalledWith(1);
        });

        it('debería propagar error si falla', async () => {
            mockProductosService.remove.mockRejectedValue(new NotFoundException());

            await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Decoradores', () => {
        it('debería estar decorado con @Controller("productos")', () => {
            const metadata = Reflect.getMetadata('path', ProductosController);
            expect(metadata).toBe('productos');
        });
    });
});