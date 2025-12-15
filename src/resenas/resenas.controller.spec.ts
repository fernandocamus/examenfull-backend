import { Test, TestingModule } from '@nestjs/testing';
import { ResenasController } from './resenas.controller';
import { ResenasService } from './resenas.service';
import { CreateResenaDto } from './dto/create-resena.dto';
import { UpdateResenaDto } from './dto/update-resena.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ResenasController', () => {
    let controller: ResenasController;
    let service: ResenasService;

    const mockResenasService = {
        create: jest.fn(),
        findByProducto: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ResenasController],
            providers: [
                {
                    provide: ResenasService,
                    useValue: mockResenasService,
                },
            ],
        }).compile();

        controller = module.get<ResenasController>(ResenasController);
        service = module.get<ResenasService>(ResenasService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        const createDto: CreateResenaDto = {
            productoId: 1,
            pedidoId: 100,
            calificacion: 5,
            comentario: 'Excelente producto',
        } as any;

        it('debería crear una reseña usando el ID de usuario por defecto (1)', async () => {
            const resultDto = { id: 1, usuarioId: 1, ...createDto };
            mockResenasService.create.mockResolvedValue(resultDto);

            const result = await controller.create(createDto);

            expect(result).toEqual(resultDto);
            expect(mockResenasService.create).toHaveBeenCalledWith(1, createDto);
        });

        it('debería propagar errores (ej. reseña duplicada)', async () => {
            mockResenasService.create.mockRejectedValue(
                new BadRequestException('Ya dejaste una reseña'),
            );

            await expect(controller.create(createDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('findByProducto', () => {
        it('debería retornar reseñas de un producto', async () => {
            const mockResenas = [{ id: 1, comentario: 'Test' }];
            mockResenasService.findByProducto.mockResolvedValue(mockResenas);

            const result = await controller.findByProducto(1);

            expect(result).toEqual(mockResenas);
            expect(mockResenasService.findByProducto).toHaveBeenCalledWith(1);
        });
    });

    describe('findOne', () => {
        it('debería retornar una reseña por ID', async () => {
            const mockResena = { id: 1, comentario: 'Test' };
            mockResenasService.findOne.mockResolvedValue(mockResena);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockResena);
            expect(mockResenasService.findOne).toHaveBeenCalledWith(1);
        });

        it('debería propagar NotFoundException si no existe', async () => {
            mockResenasService.findOne.mockRejectedValue(
                new NotFoundException('Reseña no encontrada'),
            );

            await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        const updateDto: UpdateResenaDto = { comentario: 'Editado' } as any;

        it('debería actualizar una reseña exitosamente', async () => {
            const mockUpdated = { id: 1, comentario: 'Editado' };
            mockResenasService.update.mockResolvedValue(mockUpdated);

            const result = await controller.update(1, updateDto);

            expect(result).toEqual(mockUpdated);
            expect(mockResenasService.update).toHaveBeenCalledWith(1, updateDto);
        });
    });

    describe('delete', () => {
        it('debería eliminar una reseña', async () => {
            mockResenasService.delete.mockResolvedValue(undefined);

            await controller.delete(1);

            expect(mockResenasService.delete).toHaveBeenCalledWith(1);
        });

        it('debería propagar errores si falla', async () => {
            mockResenasService.delete.mockRejectedValue(new NotFoundException());

            await expect(controller.delete(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Decoradores', () => {
        it('debería estar decorado con @Controller("resenas")', () => {
            const metadata = Reflect.getMetadata('path', ResenasController);
            expect(metadata).toBe('resenas');
        });
    });
});