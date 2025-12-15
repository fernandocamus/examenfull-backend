import { Test, TestingModule } from '@nestjs/testing';
import { CategoriasService } from './categorias.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CategoriasService', () => {
    let service: CategoriasService;
    let repository: Repository<Categoria>;

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
                CategoriasService,
                {
                    provide: getRepositoryToken(Categoria),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<CategoriasService>(CategoriasService);
        repository = module.get<Repository<Categoria>>(getRepositoryToken(Categoria));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createDto: CreateCategoriaDto = {
            nombre: 'Nueva Categoria',
            orden: 1,
        };

        it('debería crear una categoría si el nombre no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);
            const mockCategoria = { id: 1, ...createDto };
            mockRepository.create.mockReturnValue(mockCategoria);
            mockRepository.save.mockResolvedValue(mockCategoria);

            const result = await service.create(createDto);

            expect(result).toEqual(mockCategoria);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { nombre: createDto.nombre },
            });
            expect(mockRepository.save).toHaveBeenCalledWith(mockCategoria);
        });

        it('debería lanzar BadRequestException si el nombre ya existe', async () => {
            mockRepository.findOne.mockResolvedValue({ id: 2, nombre: 'Nueva Categoria' });

            await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
            await expect(service.create(createDto)).rejects.toThrow(
                'Ya existe una categoría con ese nombre',
            );
        });
    });

    describe('findAll', () => {
        it('debería retornar array de categorías ordenadas', async () => {
            const mockCategorias = [{ id: 1, orden: 1 }, { id: 2, orden: 2 }];
            mockRepository.find.mockResolvedValue(mockCategorias);

            const result = await service.findAll();

            expect(result).toEqual(mockCategorias);
            expect(mockRepository.find).toHaveBeenCalledWith({
                order: { orden: 'ASC' },
            });
        });
    });

    describe('findOne', () => {
        it('debería retornar una categoría con sus relaciones', async () => {
            const mockCategoria = { id: 1, nombre: 'Test', productos: [] };
            mockRepository.findOne.mockResolvedValue(mockCategoria);

            const result = await service.findOne(1);

            expect(result).toEqual(mockCategoria);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['productos'],
            });
        });

        it('debería lanzar NotFoundException si no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(999)).rejects.toThrow(
                'Categoría con ID 999 no encontrada',
            );
        });
    });

    describe('update', () => {
        const mockCategoria = { id: 1, nombre: 'Original' };

        beforeEach(() => {
            mockRepository.findOne.mockResolvedValue(mockCategoria);
        });

        it('debería actualizar nombre si no hay duplicados', async () => {
            const updateDto: UpdateCategoriaDto = { nombre: 'Nuevo Nombre' };

            mockRepository.findOne
                .mockResolvedValueOnce(mockCategoria)
                .mockResolvedValueOnce(null);

            mockRepository.save.mockResolvedValue({ ...mockCategoria, ...updateDto });

            const result = await service.update(1, updateDto);

            expect(result.nombre).toBe('Nuevo Nombre');
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('debería lanzar BadRequestException si el nuevo nombre ya está en uso', async () => {
            const updateDto: UpdateCategoriaDto = { nombre: 'Nombre Ocupado' };

            mockRepository.findOne
                .mockResolvedValueOnce(mockCategoria)
                .mockResolvedValueOnce({ id: 2, nombre: 'Nombre Ocupado' });

            await expect(service.update(1, updateDto)).rejects.toThrow(BadRequestException);
        });

        it('debería permitir actualizar otros campos sin validar nombre', async () => {
            const updateDto: UpdateCategoriaDto = { descripcion: 'Nueva desc' };
            mockRepository.save.mockResolvedValue({ ...mockCategoria, ...updateDto });

            await service.update(1, updateDto);

            expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('debería lanzar NotFoundException si la categoría a editar no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('debería eliminar una categoría existente', async () => {
            const mockCategoria = { id: 1 };
            mockRepository.findOne.mockResolvedValue(mockCategoria);
            mockRepository.remove.mockResolvedValue(mockCategoria);

            await service.remove(1);

            expect(mockRepository.remove).toHaveBeenCalledWith(mockCategoria);
        });

        it('debería lanzar NotFoundException si no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(NotFoundException);
            expect(mockRepository.remove).not.toHaveBeenCalled();
        });
    });
});