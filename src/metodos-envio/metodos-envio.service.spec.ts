import { Test, TestingModule } from '@nestjs/testing';
import { MetodosEnvioService } from './metodos-envio.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetodoEnvio } from './entities/metodo-envio.entity';
import { CreateMetodoEnvioDto } from './dto/create-metodo-envio.dto';
import { UpdateMetodoEnvioDto } from './dto/update-metodo-envio.dto';
import { NotFoundException } from '@nestjs/common';

describe('MetodosEnvioService', () => {
    let service: MetodosEnvioService;
    let repository: Repository<MetodoEnvio>;

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
                MetodosEnvioService,
                {
                    provide: getRepositoryToken(MetodoEnvio),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<MetodosEnvioService>(MetodosEnvioService);
        repository = module.get<Repository<MetodoEnvio>>(getRepositoryToken(MetodoEnvio));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createDto: CreateMetodoEnvioDto = {
            nombre: 'Test Envío',
            costo: 1000,
            tiempoEstimado: '1 día',
            activo: true,
        };

        it('debería crear y guardar un nuevo método', async () => {
            const mockMetodo = { id: 1, ...createDto };
            mockRepository.create.mockReturnValue(mockMetodo);
            mockRepository.save.mockResolvedValue(mockMetodo);

            const result = await service.create(createDto);

            expect(result).toEqual(mockMetodo);
            expect(mockRepository.create).toHaveBeenCalledWith(createDto);
            expect(mockRepository.save).toHaveBeenCalledWith(mockMetodo);
        });
    });

    describe('findAll', () => {
        it('debería retornar todos los métodos', async () => {
            const mockMetodos = [{ id: 1, nombre: 'Test' }];
            mockRepository.find.mockResolvedValue(mockMetodos);

            const result = await service.findAll();

            expect(result).toEqual(mockMetodos);
            expect(mockRepository.find).toHaveBeenCalled();
        });
    });

    describe('findAllActive', () => {
        it('debería retornar solo los métodos activos', async () => {
            const mockMetodosActivos = [{ id: 1, nombre: 'Test', activo: true }];
            mockRepository.find.mockResolvedValue(mockMetodosActivos);

            const result = await service.findAllActive();

            expect(result).toEqual(mockMetodosActivos);
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { activo: true },
            });
        });
    });

    describe('findOne', () => {
        it('debería retornar un método si existe', async () => {
            const mockMetodo = { id: 1, nombre: 'Test' };
            mockRepository.findOne.mockResolvedValue(mockMetodo);

            const result = await service.findOne(1);

            expect(result).toEqual(mockMetodo);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
            });
        });

        it('debería lanzar NotFoundException si no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(999)).rejects.toThrow(
                'Método de envío con ID 999 no encontrado',
            );
        });
    });

    describe('update', () => {
        const mockMetodo = { id: 1, nombre: 'Original', precio: 1000 };

        it('debería actualizar un método correctamente', async () => {
            const updateDto: UpdateMetodoEnvioDto = { costo: 2000 };
            const updatedMetodo = { ...mockMetodo, ...updateDto };

            mockRepository.findOne.mockResolvedValue(mockMetodo);
            mockRepository.save.mockResolvedValue(updatedMetodo);

            const result = await service.update(1, updateDto);

            expect(result.costo).toBe(2000);
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('debería lanzar NotFoundException si el método a actualizar no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('debería eliminar un método existente', async () => {
            const mockMetodo = { id: 1 };
            mockRepository.findOne.mockResolvedValue(mockMetodo);
            mockRepository.remove.mockResolvedValue(mockMetodo);

            await service.remove(1);

            expect(mockRepository.remove).toHaveBeenCalledWith(mockMetodo);
        });

        it('debería lanzar NotFoundException si intenta borrar uno inexistente', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(NotFoundException);
            expect(mockRepository.remove).not.toHaveBeenCalled();
        });
    });
});