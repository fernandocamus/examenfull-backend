import { Test, TestingModule } from '@nestjs/testing';
import { ResenasService } from './resenas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resena } from './entities/resena.entity';
import { CreateResenaDto } from './dto/create-resena.dto';
import { UpdateResenaDto } from './dto/update-resena.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ResenasService', () => {
    let service: ResenasService;
    let repository: Repository<Resena>;

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
                ResenasService,
                {
                    provide: getRepositoryToken(Resena),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<ResenasService>(ResenasService);
        repository = module.get<Repository<Resena>>(getRepositoryToken(Resena));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createDto: CreateResenaDto = {
            productoId: 1,
            pedidoId: 10,
            calificacion: 5,
            comentario: 'Buen producto',
        } as any;

        it('debería crear una reseña si no existe una previa', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const mockResena = { id: 1, usuarioId: 1, ...createDto };
            mockRepository.create.mockReturnValue(mockResena);
            mockRepository.save.mockResolvedValue(mockResena);

            const result = await service.create(1, createDto);

            expect(result).toEqual(mockResena);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: {
                    usuarioId: 1,
                    productoId: createDto.productoId,
                    pedidoId: createDto.pedidoId,
                },
            });
            expect(mockRepository.create).toHaveBeenCalled();
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('debería lanzar BadRequestException si ya existe una reseña', async () => {
            mockRepository.findOne.mockResolvedValue({ id: 5 });

            await expect(service.create(1, createDto)).rejects.toThrow(BadRequestException);
            await expect(service.create(1, createDto)).rejects.toThrow(
                'Ya dejaste una reseña para este producto',
            );
        });
    });

    describe('findByProducto', () => {
        it('debería retornar reseñas de un producto ordenadas', async () => {
            const mockResenas = [{ id: 1, comentario: 'Test' }];
            mockRepository.find.mockResolvedValue(mockResenas);

            const result = await service.findByProducto(1);

            expect(result).toEqual(mockResenas);
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { productoId: 1 },
                relations: ['usuario'],
                order: { fechaCreacion: 'DESC' },
            });
        });
    });

    describe('findOne', () => {
        it('debería retornar una reseña si existe', async () => {
            const mockResena = { id: 1, comentario: 'Test' };
            mockRepository.findOne.mockResolvedValue(mockResena);

            const result = await service.findOne(1);

            expect(result).toEqual(mockResena);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['usuario', 'producto'],
            });
        });

        it('debería lanzar NotFoundException si no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(999)).rejects.toThrow(
                'Reseña con ID 999 no encontrada',
            );
        });
    });

    describe('update', () => {
        const mockResena = { id: 1, comentario: 'Original', calificacion: 4 };

        it('debería actualizar una reseña correctamente', async () => {
            const updateDto: UpdateResenaDto = { comentario: 'Editado' } as any;

            mockRepository.findOne.mockResolvedValue(mockResena);
            mockRepository.save.mockImplementation(r => Promise.resolve(r));

            const result = await service.update(1, updateDto);

            expect(result.comentario).toBe('Editado');
            expect(result.calificacion).toBe(4);
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('debería lanzar NotFoundException si la reseña no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('debería eliminar una reseña existente', async () => {
            const mockResena = { id: 1 };
            mockRepository.findOne.mockResolvedValue(mockResena);
            mockRepository.remove.mockResolvedValue(mockResena);

            await service.delete(1);

            expect(mockRepository.remove).toHaveBeenCalledWith(mockResena);
        });

        it('debería lanzar NotFoundException si no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.delete(999)).rejects.toThrow(NotFoundException);
            expect(mockRepository.remove).not.toHaveBeenCalled();
        });
    });
});