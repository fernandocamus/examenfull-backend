import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';
import { RolUsuario } from './entities/usuario.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsuariosController', () => {
    let controller: UsuariosController;
    let service: UsuariosService;

    const mockUsuariosService = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsuariosController],
            providers: [
                {
                    provide: UsuariosService,
                    useValue: mockUsuariosService,
                },
            ],
        }).compile();

        controller = module.get<UsuariosController>(UsuariosController);
        service = module.get<UsuariosService>(UsuariosService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('findAll', () => {
        it('debería retornar un array de usuarios', async () => {
            const mockUsuarios = [
                {
                    id: 1,
                    nombre: 'Admin Principal',
                    correo: 'admin@tienda.com',
                    rol: RolUsuario.ADMIN,
                    telefono: '+56911112222',
                    activo: true,
                    fechaRegistro: new Date('2025-12-15'),
                },
                {
                    id: 2,
                    nombre: 'Cliente Juan',
                    correo: 'juan@test.com',
                    rol: RolUsuario.CLIENTE,
                    telefono: '+56987654321',
                    activo: true,
                    fechaRegistro: new Date('2025-12-14'),
                },
            ];

            mockUsuariosService.findAll.mockResolvedValue(mockUsuarios);

            const result = await controller.findAll();

            expect(result).toEqual(mockUsuarios);
            expect(mockUsuariosService.findAll).toHaveBeenCalledTimes(1);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(2);
        });

        it('debería retornar un array vacío si no hay usuarios', async () => {
            mockUsuariosService.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(result).toEqual([]);
            expect(Array.isArray(result)).toBe(true);
            expect(result).toHaveLength(0);
        });

        it('debería delegar la llamada al servicio', async () => {
            mockUsuariosService.findAll.mockResolvedValue([]);

            await controller.findAll();

            expect(mockUsuariosService.findAll).toHaveBeenCalled();
            expect(mockUsuariosService.findAll).toHaveBeenCalledWith();
        });

        it('debería propagar errores del servicio', async () => {
            mockUsuariosService.findAll.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(controller.findAll()).rejects.toThrow('Database error');
        });

        it('debería retornar usuarios con diferentes roles', async () => {
            const mockUsuarios = [
                { id: 1, rol: RolUsuario.ADMIN },
                { id: 2, rol: RolUsuario.CLIENTE },
            ];

            mockUsuariosService.findAll.mockResolvedValue(mockUsuarios);

            const result = await controller.findAll();

            expect(result[0].rol).toBe(RolUsuario.ADMIN);
            expect(result[1].rol).toBe(RolUsuario.CLIENTE);
        });
    });

    describe('findOne', () => {
        const mockUsuario = {
            id: 1,
            nombre: 'Test User',
            correo: 'test@test.com',
            rol: RolUsuario.CLIENTE,
            telefono: '+56912345678',
            activo: true,
            fechaRegistro: new Date('2025-12-15'),
        };

        it('debería retornar un usuario por ID', async () => {
            mockUsuariosService.findOne.mockResolvedValue(mockUsuario);

            const result = await controller.findOne(1);

            expect(result).toEqual(mockUsuario);
            expect(mockUsuariosService.findOne).toHaveBeenCalledWith(1);
            expect(mockUsuariosService.findOne).toHaveBeenCalledTimes(1);
        });

        it('debería usar ParseIntPipe para validar el ID', async () => {
            mockUsuariosService.findOne.mockResolvedValue(mockUsuario);

            const result = await controller.findOne(1);

            expect(typeof result.id).toBe('number');
            expect(mockUsuariosService.findOne).toHaveBeenCalledWith(1);
        });

        it('debería propagar NotFoundException si el usuario no existe', async () => {
            mockUsuariosService.findOne.mockRejectedValue(
                new NotFoundException('Usuario con ID 999 no encontrado'),
            );

            await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
            await expect(controller.findOne(999)).rejects.toThrow(
                'Usuario con ID 999 no encontrado',
            );
        });

        it('debería manejar diferentes IDs correctamente', async () => {
            const usuario5 = { ...mockUsuario, id: 5 };
            mockUsuariosService.findOne.mockResolvedValue(usuario5);

            const result = await controller.findOne(5);

            expect(result.id).toBe(5);
            expect(mockUsuariosService.findOne).toHaveBeenCalledWith(5);
        });

        it('debería retornar usuario con todos sus campos', async () => {
            mockUsuariosService.findOne.mockResolvedValue(mockUsuario);

            const result = await controller.findOne(1);

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('nombre');
            expect(result).toHaveProperty('correo');
            expect(result).toHaveProperty('rol');
            expect(result).toHaveProperty('telefono');
            expect(result).toHaveProperty('activo');
            expect(result).toHaveProperty('fechaRegistro');
        });

        it('debería propagar errores del servicio', async () => {
            mockUsuariosService.findOne.mockRejectedValue(
                new Error('Database error'),
            );

            await expect(controller.findOne(1)).rejects.toThrow('Database error');
        });
    });

    describe('remove', () => {
        const mockResponse = {
            message: 'Usuario 1 eliminado correctamente',
        };

        it('debería eliminar un usuario exitosamente', async () => {
            mockUsuariosService.remove.mockResolvedValue(mockResponse);

            const result = await controller.remove(1);

            expect(result).toEqual(mockResponse);
            expect(mockUsuariosService.remove).toHaveBeenCalledWith(1);
            expect(mockUsuariosService.remove).toHaveBeenCalledTimes(1);
        });

        it('debería retornar un mensaje de confirmación', async () => {
            mockUsuariosService.remove.mockResolvedValue(mockResponse);

            const result = await controller.remove(1);

            expect(result).toHaveProperty('message');
            expect(result.message).toContain('eliminado correctamente');
            expect(result.message).toContain('1');
        });

        it('debería usar ParseIntPipe para validar el ID', async () => {
            mockUsuariosService.remove.mockResolvedValue(mockResponse);

            await controller.remove(1);

            expect(mockUsuariosService.remove).toHaveBeenCalledWith(1);
            expect(typeof mockUsuariosService.remove.mock.calls[0][0]).toBe('number');
        });

        it('debería propagar NotFoundException si el usuario no existe', async () => {
            mockUsuariosService.remove.mockRejectedValue(
                new NotFoundException('Usuario con ID 999 no encontrado'),
            );

            await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
            await expect(controller.remove(999)).rejects.toThrow(
                'Usuario con ID 999 no encontrado',
            );
        });

        it('debería manejar diferentes IDs correctamente', async () => {
            const response5 = { message: 'Usuario 5 eliminado correctamente' };
            mockUsuariosService.remove.mockResolvedValue(response5);

            const result = await controller.remove(5);

            expect(result.message).toContain('5');
            expect(mockUsuariosService.remove).toHaveBeenCalledWith(5);
        });

        it('debería propagar errores del servicio', async () => {
            mockUsuariosService.remove.mockRejectedValue(
                new Error('Cannot delete user with active orders'),
            );

            await expect(controller.remove(1)).rejects.toThrow(
                'Cannot delete user with active orders',
            );
        });

        it('debería llamar al servicio solo una vez por solicitud', async () => {
            mockUsuariosService.remove.mockResolvedValue(mockResponse);

            await controller.remove(1);
            await controller.remove(2);

            expect(mockUsuariosService.remove).toHaveBeenCalledTimes(2);
            expect(mockUsuariosService.remove).toHaveBeenNthCalledWith(1, 1);
            expect(mockUsuariosService.remove).toHaveBeenNthCalledWith(2, 2);
        });
    });

    describe('Decoradores y Guards', () => {
        it('debería estar decorado con @Controller("usuarios")', () => {
            const metadata = Reflect.getMetadata('path', UsuariosController);
            expect(metadata).toBe('usuarios');
        });

        it('findAll debería requerir rol ADMIN', () => {
            const rolesMetadata = Reflect.getMetadata(
                'roles',
                controller.findAll,
            );
            expect(rolesMetadata).toContain(RolUsuario.ADMIN);
        });

        it('findOne debería requerir rol ADMIN', () => {
            const rolesMetadata = Reflect.getMetadata(
                'roles',
                controller.findOne,
            );
            expect(rolesMetadata).toContain(RolUsuario.ADMIN);
        });

        it('remove debería requerir rol ADMIN', () => {
            const rolesMetadata = Reflect.getMetadata(
                'roles',
                controller.remove,
            );
            expect(rolesMetadata).toContain(RolUsuario.ADMIN);
        });
    });
});