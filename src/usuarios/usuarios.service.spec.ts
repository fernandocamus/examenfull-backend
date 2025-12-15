import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from './usuarios.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario, RolUsuario } from './entities/usuario.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcryptjs from 'bcryptjs';

describe('UsuariosService', () => {
    let service: UsuariosService;
    let repository: Repository<Usuario>;

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        remove: jest.fn(),
        createQueryBuilder: jest.fn(),
    };

    const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsuariosService,
                {
                    provide: getRepositoryToken(Usuario),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<UsuariosService>(UsuariosService);
        repository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createUsuarioDto: CreateUsuarioDto = {
            nombre: 'Test User',
            correo: 'test@test.com',
            contrasena: 'hashed_password',
            telefono: '+56912345678',
            rol: RolUsuario.CLIENTE,
        };

        it('debería crear un usuario exitosamente', async () => {
            const mockUsuario = {
                id: 1,
                ...createUsuarioDto,
                fechaRegistro: new Date(),
                activo: true,
            };

            mockRepository.create.mockReturnValue(mockUsuario);
            mockRepository.save.mockResolvedValue(mockUsuario);

            const result = await service.create(createUsuarioDto);

            expect(result).toEqual(mockUsuario);
            expect(mockRepository.create).toHaveBeenCalledWith(createUsuarioDto);
            expect(mockRepository.save).toHaveBeenCalledWith(mockUsuario);
        });

        it('debería propagar errores de la base de datos', async () => {
            mockRepository.create.mockReturnValue(createUsuarioDto);
            mockRepository.save.mockRejectedValue(new Error('Database error'));

            await expect(service.create(createUsuarioDto)).rejects.toThrow(
                'Database error',
            );
        });
    });

    describe('findAll', () => {
        it('debería retornar un array de usuarios ordenados por fecha', async () => {
            const mockUsuarios = [
                {
                    id: 2,
                    nombre: 'Usuario 2',
                    correo: 'user2@test.com',
                    fechaRegistro: new Date('2025-12-15'),
                },
                {
                    id: 1,
                    nombre: 'Usuario 1',
                    correo: 'user1@test.com',
                    fechaRegistro: new Date('2025-12-14'),
                },
            ];

            mockRepository.find.mockResolvedValue(mockUsuarios);

            const result = await service.findAll();

            expect(result).toEqual(mockUsuarios);
            expect(mockRepository.find).toHaveBeenCalledWith({
                order: { fechaRegistro: 'DESC' },
            });
        });

        it('debería retornar un array vacío si no hay usuarios', async () => {
            mockRepository.find.mockResolvedValue([]);

            const result = await service.findAll();

            expect(result).toEqual([]);
            expect(Array.isArray(result)).toBe(true);
        });

        it('debería manejar errores de la base de datos', async () => {
            mockRepository.find.mockRejectedValue(new Error('Database error'));

            await expect(service.findAll()).rejects.toThrow('Database error');
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
        };

        it('debería retornar un usuario por ID', async () => {
            mockRepository.findOne.mockResolvedValue(mockUsuario);

            const result = await service.findOne(1);

            expect(result).toEqual(mockUsuario);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
            });
        });

        it('debería lanzar NotFoundException si el usuario no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
            await expect(service.findOne(999)).rejects.toThrow(
                'Usuario con ID 999 no encontrado',
            );
        });

        it('debería manejar diferentes IDs correctamente', async () => {
            const usuario5 = { ...mockUsuario, id: 5 };
            mockRepository.findOne.mockResolvedValue(usuario5);

            const result = await service.findOne(5);

            expect(result.id).toBe(5);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 5 },
            });
        });
    });

    describe('findOneByEmail', () => {
        const mockUsuario = {
            id: 1,
            nombre: 'Test User',
            correo: 'test@test.com',
        };

        it('debería retornar un usuario por correo', async () => {
            mockRepository.findOne.mockResolvedValue(mockUsuario);

            const result = await service.findOneByEmail('test@test.com');

            expect(result).toEqual(mockUsuario);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { correo: 'test@test.com' },
            });
        });

        it('debería retornar null si el correo no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            const result = await service.findOneByEmail('noexiste@test.com');

            expect(result).toBeNull();
        });

        it('debería buscar correos case-sensitive', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await service.findOneByEmail('TEST@test.com');

            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { correo: 'TEST@test.com' },
            });
        });
    });

    describe('findOneByEmailWithPassword', () => {
        it('debería retornar un usuario con contraseña incluida', async () => {
            const mockUsuario = {
                id: 1,
                nombre: 'Test User',
                correo: 'test@test.com',
                contrasena: '$2b$10$hashedPassword',
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
            mockQueryBuilder.getOne.mockResolvedValue(mockUsuario);

            const result = await service.findOneByEmailWithPassword('test@test.com');

            expect(result).toEqual(mockUsuario);
            expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith('usuario');
            expect(mockQueryBuilder.where).toHaveBeenCalledWith(
                'usuario.correo = :correo',
                { correo: 'test@test.com' },
            );
            expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
                'usuario.contrasena',
            );
        });

        it('debería retornar null si el usuario no existe', async () => {
            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
            mockQueryBuilder.getOne.mockResolvedValue(null);

            const result = await service.findOneByEmailWithPassword(
                'noexiste@test.com',
            );

            expect(result).toBeNull();
        });

        it('debería incluir el campo contrasena en la respuesta', async () => {
            const mockUsuario = {
                id: 1,
                correo: 'test@test.com',
                contrasena: '$2b$10$hashedPassword',
            };

            mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
            mockQueryBuilder.getOne.mockResolvedValue(mockUsuario);

            const result = await service.findOneByEmailWithPassword('test@test.com');

            expect(result).not.toBeNull();

            expect(result).toHaveProperty('contrasena');
            expect(result!.contrasena).toBeTruthy();

        });
    });

    describe('update', () => {
        const mockUsuario = {
            id: 1,
            nombre: 'Test User',
            correo: 'test@test.com',
            contrasena: 'old_hash',
            telefono: '+56912345678',
            rol: RolUsuario.CLIENTE,
        };

        const updateDto: UpdateUsuarioDto = {
            nombre: 'Updated Name',
            telefono: '+56987654321',
        };

        beforeEach(() => {
            mockRepository.findOne.mockResolvedValue(mockUsuario);
        });

        it('debería actualizar un usuario exitosamente', async () => {
            const updatedUsuario = { ...mockUsuario, ...updateDto };
            mockRepository.save.mockResolvedValue(updatedUsuario);

            const result = await service.update(1, updateDto);

            expect(result.nombre).toBe('Updated Name');
            expect(result.telefono).toBe('+56987654321');
            expect(mockRepository.save).toHaveBeenCalled();
        });

        it('debería validar que el nuevo correo no esté en uso', async () => {
            const updateWithEmail: UpdateUsuarioDto = {
                correo: 'nuevo@test.com',
            };

            mockRepository.findOne
                .mockResolvedValueOnce(mockUsuario)
                .mockResolvedValueOnce({ id: 2, correo: 'nuevo@test.com' });

            await expect(service.update(1, updateWithEmail)).rejects.toThrow(
                BadRequestException,
            );
            await expect(service.update(1, updateWithEmail)).rejects.toThrow(
                'El correo ya está en uso',
            );
        });

        it('debería permitir actualizar con el mismo correo', async () => {
            const updateWithSameEmail: UpdateUsuarioDto = {
                correo: 'test@test.com',
            };

            mockRepository.save.mockResolvedValue(mockUsuario);

            const result = await service.update(1, updateWithSameEmail);

            expect(result).toBeDefined();
        });

        it('debería lanzar NotFoundException si el usuario no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.update(999, updateDto)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('debería actualizar múltiples campos a la vez', async () => {
            const multiUpdate: UpdateUsuarioDto = {
                nombre: 'Nuevo Nombre',
                telefono: '+56999888777',
                rol: RolUsuario.ADMIN,
            };

            const updatedUsuario = { ...mockUsuario, ...multiUpdate };
            mockRepository.save.mockResolvedValue(updatedUsuario);

            const result = await service.update(1, multiUpdate);

            expect(result.nombre).toBe('Nuevo Nombre');
            expect(result.telefono).toBe('+56999888777');
            expect(result.rol).toBe(RolUsuario.ADMIN);
        });
    });

    describe('remove', () => {
        const mockUsuario = {
            id: 1,
            nombre: 'Test User',
            correo: 'test@test.com',
        };

        it('debería eliminar un usuario exitosamente', async () => {
            mockRepository.findOne.mockResolvedValue(mockUsuario);
            mockRepository.remove.mockResolvedValue(mockUsuario);

            const result = await service.remove(1);

            expect(result).toEqual({
                message: 'Usuario 1 eliminado correctamente',
            });
            expect(mockRepository.remove).toHaveBeenCalledWith(mockUsuario);
        });

        it('debería lanzar NotFoundException si el usuario no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(NotFoundException);
            await expect(service.remove(999)).rejects.toThrow(
                'Usuario con ID 999 no encontrado',
            );
            expect(mockRepository.remove).not.toHaveBeenCalled();
        });

        it('debería manejar errores de la base de datos', async () => {
            mockRepository.findOne.mockResolvedValue(mockUsuario);
            mockRepository.remove.mockRejectedValue(new Error('Database error'));

            await expect(service.remove(1)).rejects.toThrow('Database error');
        });

        it('debería retornar mensaje con el ID correcto', async () => {
            mockRepository.findOne.mockResolvedValue({ ...mockUsuario, id: 5 });
            mockRepository.remove.mockResolvedValue({ ...mockUsuario, id: 5 });

            const result = await service.remove(5);

            expect(result.message).toContain('5');
            expect(result.message).toBe('Usuario 5 eliminado correctamente');
        });
    });

    describe('toggleActive', () => {
        const mockUsuario = {
            id: 1,
            nombre: 'Test User',
            correo: 'test@test.com',
            activo: true,
        };

        it('debería alternar el estado activo del usuario', async () => {
            mockRepository.findOne.mockResolvedValue(mockUsuario);
            mockRepository.save.mockResolvedValue(mockUsuario);

            const result = await service.toggleActive(1);

            expect(result).toEqual(mockUsuario);
            expect(mockRepository.save).toHaveBeenCalledWith(mockUsuario);
        });

        it('debería lanzar NotFoundException si el usuario no existe', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.toggleActive(999)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('debería guardar el usuario después de encontrarlo', async () => {
            mockRepository.findOne.mockResolvedValue(mockUsuario);
            mockRepository.save.mockResolvedValue(mockUsuario);

            await service.toggleActive(1);

            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(mockRepository.save).toHaveBeenCalled();
        });
    });
});