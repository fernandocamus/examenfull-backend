import { Test, TestingModule } from '@nestjs/testing';
import { MetodosEnvioController } from './metodos-envio.controller';
import { MetodosEnvioService } from './metodos-envio.service';
import { CreateMetodoEnvioDto } from './dto/create-metodo-envio.dto';
import { UpdateMetodoEnvioDto } from './dto/update-metodo-envio.dto';
import { NotFoundException } from '@nestjs/common';

describe('MetodosEnvioController', () => {
    let controller: MetodosEnvioController;
    let service: MetodosEnvioService;

    const mockMetodosEnvioService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MetodosEnvioController],
            providers: [
                {
                    provide: MetodosEnvioService,
                    useValue: mockMetodosEnvioService,
                },
            ],
        }).compile();

        controller = module.get<MetodosEnvioController>(MetodosEnvioController);
        service = module.get<MetodosEnvioService>(MetodosEnvioService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        const createDto: CreateMetodoEnvioDto = {
            nombre: 'Envío Express',
            costo: 5000,
            tiempoEstimado: '24 horas',
            activo: true,
        };

        it('debería crear un método de envío exitosamente', async () => {
            const resultDto = { id: 1, ...createDto };
            mockMetodosEnvioService.create.mockResolvedValue(resultDto);

            const result = await controller.create(createDto);

            expect(result).toEqual(resultDto);
            expect(mockMetodosEnvioService.create).toHaveBeenCalledWith(createDto);
        });
    });

    describe('findAll', () => {
        it('debería retornar todos los métodos de envío', async () => {
            const mockMetodos = [{ id: 1, nombre: 'Standard' }];
            mockMetodosEnvioService.findAll.mockResolvedValue(mockMetodos);

            const result = await controller.findAll();

            expect(result).toEqual(mockMetodos);
            expect(mockMetodosEnvioService.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('debería retornar un método por ID', async () => {
            const mockMetodo = { id: 1, nombre: 'Standard' };
            mockMetodosEnvioService.findOne.mockResolvedValue(mockMetodo);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockMetodo);
            expect(mockMetodosEnvioService.findOne).toHaveBeenCalledWith(1);
        });

        it('debería propagar NotFoundException si no existe', async () => {
            mockMetodosEnvioService.findOne.mockRejectedValue(
                new NotFoundException('Método no encontrado'),
            );

            await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        const updateDto: UpdateMetodoEnvioDto = { costo: 6000 };

        it('debería actualizar un método exitosamente', async () => {
            const mockUpdated = { id: 1, nombre: 'Standard', precio: 6000 };
            mockMetodosEnvioService.update.mockResolvedValue(mockUpdated);

            const result = await controller.update(1, updateDto);

            expect(result).toEqual(mockUpdated);
            expect(mockMetodosEnvioService.update).toHaveBeenCalledWith(1, updateDto);
        });

        it('debería propagar NotFoundException si el método no existe', async () => {
            mockMetodosEnvioService.update.mockRejectedValue(
                new NotFoundException('Método no encontrado'),
            );

            await expect(controller.update(999, updateDto)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('remove', () => {
        it('debería eliminar un método de envío', async () => {
            mockMetodosEnvioService.remove.mockResolvedValue(undefined);

            await controller.remove(1);

            expect(mockMetodosEnvioService.remove).toHaveBeenCalledWith(1);
        });

        it('debería propagar errores si falla', async () => {
            mockMetodosEnvioService.remove.mockRejectedValue(new NotFoundException());

            await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('Decoradores', () => {
        it('debería estar decorado con @Controller("metodos-envio")', () => {
            const metadata = Reflect.getMetadata('path', MetodosEnvioController);
            expect(metadata).toBe('metodos-envio');
        });
    });
});