import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

describe('AuthService', () => {
    let service: AuthService;
    let usuariosService: UsuariosService;
    let jwtService: JwtService;

    const mockUsuariosService = {
        findOneByEmail: jest.fn(),
        findOneByEmailWithPassword: jest.fn(),
        create: jest.fn(),
        findOne: jest.fn(),
    };

    const mockJwtService = {
        signAsync: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsuariosService,
                    useValue: mockUsuariosService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usuariosService = module.get<UsuariosService>(UsuariosService);
        jwtService = module.get<JwtService>(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        const registerDto = {
            nombre: 'Test User',
            correo: 'test@test.com',
            contrasena: '123456',
            telefono: '+56912345678',
            rol: 'CLIENTE' as any,
        };

        it('debería registrar un usuario exitosamente', async () => {
            mockUsuariosService.findOneByEmail.mockResolvedValue(null);
            mockUsuariosService.create.mockResolvedValue({
                id: 1,
                ...registerDto,
                contrasena: 'hashed_password',
            });

            const result = await service.register(registerDto);

            expect(result).toEqual({ message: 'Usuario registrado exitosamente' });
            expect(mockUsuariosService.findOneByEmail).toHaveBeenCalledWith('test@test.com');
            expect(mockUsuariosService.create).toHaveBeenCalledWith({
                nombre: registerDto.nombre,
                correo: registerDto.correo,
                contrasena: expect.any(String),
                telefono: registerDto.telefono,
                rol: registerDto.rol,
            });
        });

        it('debería hashear la contraseña antes de guardarla', async () => {
            mockUsuariosService.findOneByEmail.mockResolvedValue(null);
            mockUsuariosService.create.mockResolvedValue({ id: 1 });

            await service.register(registerDto);

            const createCall = mockUsuariosService.create.mock.calls[0][0];
            const hashedPassword = createCall.contrasena;

            expect(hashedPassword).not.toBe('123456');
            expect(hashedPassword.length).toBeGreaterThan(20);

            const isValid = await bcryptjs.compare('123456', hashedPassword);
            expect(isValid).toBe(true);
        });

        it('debería lanzar BadRequestException si el correo ya existe', async () => {
            mockUsuariosService.findOneByEmail.mockResolvedValue({
                id: 1,
                correo: 'test@test.com',
            });

            await expect(service.register(registerDto)).rejects.toThrow(
                BadRequestException,
            );
            await expect(service.register(registerDto)).rejects.toThrow(
                'El correo ya está registrado',
            );
            expect(mockUsuariosService.create).not.toHaveBeenCalled();
        });

        it('debería manejar errores del servicio de usuarios', async () => {
            mockUsuariosService.findOneByEmail.mockResolvedValue(null);
            mockUsuariosService.create.mockRejectedValue(new Error('Database error'));

            await expect(service.register(registerDto)).rejects.toThrow('Database error');
        });
    });

    describe('login', () => {
        const loginDto = {
            correo: 'admin@tienda.com',
            contrasena: '123456',
        };

        it('debería hacer login exitosamente con credenciales válidas', async () => {
            const hashedPassword = await bcryptjs.hash('123456', 10);
            const mockUser = {
                id: 1,
                nombre: 'Admin',
                correo: 'admin@tienda.com',
                contrasena: hashedPassword,
                rol: 'ADMIN',
                telefono: '+56911112222',
                activo: true,
            };

            mockUsuariosService.findOneByEmailWithPassword.mockResolvedValue(mockUser);
            mockJwtService.signAsync.mockResolvedValue('fake-jwt-token-12345');

            const result = await service.login(loginDto);

            expect(result).toEqual({
                access_token: 'fake-jwt-token-12345',
                usuario: {
                    id: 1,
                    nombre: 'Admin',
                    correo: 'admin@tienda.com',
                    rol: 'ADMIN',
                    telefono: '+56911112222',
                },
            });
            expect(mockUsuariosService.findOneByEmailWithPassword).toHaveBeenCalledWith(
                'admin@tienda.com',
            );
        });

        it('debería generar un token JWT con el payload correcto', async () => {
            const hashedPassword = await bcryptjs.hash('123456', 10);
            const mockUser = {
                id: 5,
                nombre: 'Juan Pérez',
                correo: 'juan@test.com',
                contrasena: hashedPassword,
                rol: 'CLIENTE',
                telefono: '+56912345678',
                activo: true,
            };

            mockUsuariosService.findOneByEmailWithPassword.mockResolvedValue(mockUser);
            mockJwtService.signAsync.mockResolvedValue('token-abc123');

            await service.login(loginDto);

            expect(mockJwtService.signAsync).toHaveBeenCalledWith({
                sub: 5,
                correo: 'juan@test.com',
                nombre: 'Juan Pérez',
                rol: 'CLIENTE',
            });
        });

        it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
            mockUsuariosService.findOneByEmailWithPassword.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(service.login(loginDto)).rejects.toThrow(
                'Correo o contraseña inválidos',
            );
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });

        it('debería lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
            const hashedPassword = await bcryptjs.hash('123456', 10);
            const mockUser = {
                id: 1,
                correo: 'admin@tienda.com',
                contrasena: hashedPassword,
                activo: true,
            };

            mockUsuariosService.findOneByEmailWithPassword.mockResolvedValue(mockUser);

            await expect(
                service.login({ correo: 'admin@tienda.com', contrasena: 'incorrecta' }),
            ).rejects.toThrow(UnauthorizedException);
            await expect(
                service.login({ correo: 'admin@tienda.com', contrasena: 'incorrecta' }),
            ).rejects.toThrow('Correo o contraseña inválidos');
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });

        it('debería lanzar UnauthorizedException si el usuario está desactivado', async () => {
            const hashedPassword = await bcryptjs.hash('123456', 10);
            const mockUser = {
                id: 1,
                nombre: 'Usuario Desactivado',
                correo: 'desactivado@test.com',
                contrasena: hashedPassword,
                rol: 'CLIENTE',
                telefono: '+56912345678',
                activo: false,
            };

            mockUsuariosService.findOneByEmailWithPassword.mockResolvedValue(mockUser);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(service.login(loginDto)).rejects.toThrow(
                'Usuario desactivado',
            );
            expect(mockJwtService.signAsync).not.toHaveBeenCalled();
        });

    });

    describe('getProfile', () => {
        it('debería retornar el perfil del usuario', async () => {
            const mockProfile = {
                id: 1,
                nombre: 'Test User',
                correo: 'test@test.com',
                rol: 'CLIENTE',
                telefono: '+56912345678',
            };

            mockUsuariosService.findOne.mockResolvedValue(mockProfile);

            const result = await service.getProfile(1);

            expect(result).toEqual(mockProfile);
            expect(mockUsuariosService.findOne).toHaveBeenCalledWith(1);
        });

        it('debería manejar errores al buscar el perfil', async () => {
            mockUsuariosService.findOne.mockRejectedValue(
                new Error('Usuario no encontrado'),
            );

            await expect(service.getProfile(999)).rejects.toThrow(
                'Usuario no encontrado',
            );
        });

        it('debería retornar null si el usuario no existe', async () => {
            mockUsuariosService.findOne.mockResolvedValue(null);

            const result = await service.getProfile(999);

            expect(result).toBeNull();
        });
    });
});