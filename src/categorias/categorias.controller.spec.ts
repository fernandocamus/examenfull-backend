import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasController } from './categorias.controller';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { RolUsuario } from '../usuarios/entities/usuario.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CategoriasController', () => {
    let controller: CategoriasController;
    let service: CategoriasService;

    const mockCategoriasService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CategoriasController],
            providers: [
                {
                    provide: CategoriasService,
                    useValue: mockCategoriasService,
                },
            ],
        }).compile();

        controller = module.get<CategoriasController>(CategoriasController);
        service = module.get<CategoriasService>(CategoriasService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        const createDto: CreateCategoriaDto = {
            nombre: 'Electrónica',
            descripcion: 'Productos electrónicos',
            orden: 1,
        };

        it('debería crear una categoría exitosamente', async () => {
            const resultDto = { id: 1, ...createDto };
            mockCategoriasService.create.mockResolvedValue(resultDto);

            const result = await controller.create(createDto);

            expect(result).toEqual(resultDto);
            expect(mockCategoriasService.create).toHaveBeenCalledWith(createDto);
        });

        it('debería propagar error si el nombre ya existe', async () => {
            mockCategoriasService.create.mockRejectedValue(
                new BadRequestException('Ya existe una categoría con ese nombre'),
            );

            await expect(controller.create(createDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('findAll', () => {
        it('debería retornar un array de categorías', async () => {
            const mockCategorias = [{ id: 1, nombre: 'Test' }];
            mockCategoriasService.findAll.mockResolvedValue(mockCategorias);

            const result = await controller.findAll();

            expect(result).toEqual(mockCategorias);
            expect(mockCategoriasService.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('debería retornar una categoría por ID', async () => {
            const mockCategoria = { id: 1, nombre: 'Test' };
            mockCategoriasService.findOne.mockResolvedValue(mockCategoria);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockCategoria);
            expect(mockCategoriasService.findOne).toHaveBeenCalledWith(1);
        });

        it('debería propagar NotFoundException si no existe', async () => {
            mockCategoriasService.findOne.mockRejectedValue(
                new NotFoundException('Categoría no encontrada'),
            );

            await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        const updateDto: UpdateCategoriaDto = { nombre: 'Nuevo Nombre' };

        it('debería actualizar una categoría exitosamente', async () => {
            const mockUpdated = { id: 1, nombre: 'Nuevo Nombre' };
            mockCategoriasService.update.mockResolvedValue(mockUpdated);

            const result = await controller.update(1, updateDto);

            expect(result).toEqual(mockUpdated);
            expect(mockCategoriasService.update).toHaveBeenCalledWith(1, updateDto);
        });

        it('debería propagar error de nombre duplicado', async () => {
            mockCategoriasService.update.mockRejectedValue(
                new BadRequestException('Ya existe una categoría con ese nombre'),
            );

            await expect(controller.update(1, updateDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('remove', () => {
        it('debería eliminar una categoría', async () => {
            mockCategoriasService.remove.mockResolvedValue(undefined);

            await controller.remove(1);

            expect(mockCategoriasService.remove).toHaveBeenCalledWith(1);
        });

        it('debería propagar error si no existe', async () => {
            mockCategoriasService.remove.mockRejectedValue(new NotFoundException());

            await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Decoradores y Roles', () => {
        it('debería estar decorado con @Controller("categorias")', () => {
            const metadata = Reflect.getMetadata('path', CategoriasController);
            expect(metadata).toBe('categorias');
        });

        it('create debería requerir rol ADMIN', () => {
            const roles = Reflect.getMetadata('roles', controller.create);
            expect(roles).toContain(RolUsuario.ADMIN);
        });

        it('update debería requerir rol ADMIN', () => {
            const roles = Reflect.getMetadata('roles', controller.update);
            expect(roles).toContain(RolUsuario.ADMIN);
        });

        it('remove debería requerir rol ADMIN', () => {
            const roles = Reflect.getMetadata('roles', controller.remove);
            expect(roles).toContain(RolUsuario.ADMIN);
        });
    });
});