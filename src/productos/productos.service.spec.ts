import { Test, TestingModule } from '@nestjs/testing';
import { ProductosService } from './productos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/productos.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProductosService', () => {
    let service: ProductosService;
    let repository: Repository<Producto>;

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductosService,
                {
                    provide: getRepositoryToken(Producto),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<ProductosService>(ProductosService);
        repository = module.get<Repository<Producto>>(getRepositoryToken(Producto));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createDto: CreateProductoDto = {
            nombre: 'Test Prod',
            precioBase: 1000,
            stockActual: 10,
            categoriaId: 1,
        } as any;

        it('debería crear un producto y calcular precioConIva (defecto 19%)', async () => {
            const mockProducto = { ...createDto, iva: 19, precioConIva: 1190 };

            mockRepository.create.mockReturnValue(mockProducto);
            mockRepository.save.mockResolvedValue(mockProducto);

            const result = await service.create(createDto);

            expect(result.precioConIva).toBe(1190);
            expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                iva: 19,
                precioConIva: 1190,
            }));
        });

        it('debería usar el IVA proporcionado si existe', async () => {
            const createDtoConIva = { ...createDto, iva: 10 };
            const mockProducto = { ...createDtoConIva, precioConIva: 1100 };

            mockRepository.create.mockReturnValue(mockProducto);
            mockRepository.save.mockResolvedValue(mockProducto);

            const result = await service.create(createDtoConIva);

            expect(result.precioConIva).toBe(1100);
        });
    });

    describe('findAll', () => {
        it('debería retornar productos con relación categoria', async () => {
            mockRepository.find.mockResolvedValue([]);

            await service.findAll();

            expect(mockRepository.find).toHaveBeenCalledWith({
                relations: ['categoria'],
                order: { id: 'DESC' },
            });
        });
    });

    describe('findOne', () => {
        it('debería retornar un producto si existe', async () => {
            const mockProducto = { id: 1, nombre: 'Test' };
            mockRepository.findOne.mockResolvedValue(mockProducto);

            const result = await service.findOne(1);

            expect(result).toEqual(mockProducto);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['categoria', 'resenas', 'resenas.usuario'],
            });
        });

        it('debería lanzar NotFoundException si no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        const mockProducto = {
            id: 1,
            nombre: 'Original',
            precioBase: 1000,
            iva: 19,
            precioConIva: 1190
        };

        it('debería actualizar campos simples', async () => {
            mockRepository.findOne.mockResolvedValue({ ...mockProducto });
            mockRepository.save.mockImplementation(p => Promise.resolve(p));

            const updateDto: UpdateProductoDto = { nombre: 'Nuevo Nombre' } as any;

            const result = await service.update(1, updateDto);

            expect(result.nombre).toBe('Nuevo Nombre');
            expect(result.precioConIva).toBe(1190);
        });

        it('debería recalcular precioConIva si cambia precioBase', async () => {
            mockRepository.findOne.mockResolvedValue({ ...mockProducto });
            mockRepository.save.mockImplementation(p => Promise.resolve(p));

            const updateDto: UpdateProductoDto = { precioBase: 2000 } as any;

            const result = await service.update(1, updateDto);

            expect(result.precioBase).toBe(2000);
            expect(result.precioConIva).toBe(2380);
        });

        it('debería lanzar NotFoundException si el producto no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('Gestión de Stock', () => {
        const mockProducto = { id: 1, nombre: 'Test', stockActual: 10 };

        describe('verificarStock', () => {
            it('debería retornar true si hay suficiente stock', async () => {
                mockRepository.findOne.mockResolvedValue(mockProducto);
                const result = await service.verificarStock(1, 5);
                expect(result).toBe(true);
            });

            it('debería retornar false si no hay stock suficiente', async () => {
                mockRepository.findOne.mockResolvedValue(mockProducto);
                const result = await service.verificarStock(1, 15);
                expect(result).toBe(false);
            });
        });

        describe('descontarStock', () => {
            it('debería descontar stock correctamente', async () => {
                const productoTest = { ...mockProducto };
                mockRepository.findOne.mockResolvedValue(productoTest);
                mockRepository.save.mockResolvedValue(productoTest);

                await service.descontarStock(1, 3);

                expect(productoTest.stockActual).toBe(7);
                expect(mockRepository.save).toHaveBeenCalled();
            });

            it('debería lanzar BadRequestException si stock es insuficiente', async () => {
                mockRepository.findOne.mockResolvedValue(mockProducto);

                await expect(service.descontarStock(1, 20)).rejects.toThrow(BadRequestException);
                await expect(service.descontarStock(1, 20)).rejects.toThrow('Stock insuficiente');
            });
        });

        describe('devolverStock', () => {
            it('debería aumentar el stock', async () => {
                const productoTest = { ...mockProducto };
                mockRepository.findOne.mockResolvedValue(productoTest);
                mockRepository.save.mockResolvedValue(productoTest);

                await service.devolverStock(1, 5);

                expect(productoTest.stockActual).toBe(15);
                expect(mockRepository.save).toHaveBeenCalled();
            });
        });
    });

    describe('remove', () => {
        it('debería eliminar un producto existente', async () => {
            const mockProducto = { id: 1 };
            mockRepository.findOne.mockResolvedValue(mockProducto);
            mockRepository.remove.mockResolvedValue(mockProducto);

            await service.remove(1);

            expect(mockRepository.remove).toHaveBeenCalledWith(mockProducto);
        });

        it('debería lanzar NotFoundException si no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            await expect(service.remove(999)).rejects.toThrow(NotFoundException);
        });
    });
});