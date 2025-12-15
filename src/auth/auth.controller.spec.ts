import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        register: jest.fn(),
        login: jest.fn(),
        getProfile: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        const registerDto: RegisterDto = {
            nombre: 'Test User',
            correo: 'test@test.com',
            contrasena: '123456',
            telefono: '+56912345678',
            rol: 'CLIENTE' as any,
        };

        it('debería registrar un usuario exitosamente', async () => {
            const expectedResult = { message: 'Usuario registrado exitosamente' };
            mockAuthService.register.mockResolvedValue(expectedResult);

            const result = await controller.register(registerDto);

            expect(result).toEqual(expectedResult);
            expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
            expect(mockAuthService.register).toHaveBeenCalledTimes(1);
        });

        it('debería propagar BadRequestException si el correo ya existe', async () => {
            mockAuthService.register.mockRejectedValue(
                new BadRequestException('El correo ya está registrado'),
            );

            await expect(controller.register(registerDto)).rejects.toThrow(
                BadRequestException,
            );
            await expect(controller.register(registerDto)).rejects.toThrow(
                'El correo ya está registrado',
            );
        });

        it('debería manejar errores inesperados', async () => {
            mockAuthService.register.mockRejectedValue(
                new Error('Error inesperado'),
            );

            await expect(controller.register(registerDto)).rejects.toThrow(
                'Error inesperado',
            );
        });
    });

    describe('login', () => {
        const loginDto: LoginDto = {
            correo: 'admin@tienda.com',
            contrasena: '123456',
        };

        const expectedLoginResponse = {
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.token',
            usuario: {
                id: 1,
                nombre: 'Admin Principal',
                correo: 'admin@tienda.com',
                rol: 'ADMIN',
                telefono: '+56911112222',
            },
        };

        it('debería hacer login exitosamente', async () => {
            mockAuthService.login.mockResolvedValue(expectedLoginResponse);

            const result = await controller.login(loginDto);

            expect(result).toEqual(expectedLoginResponse);
            expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
            expect(mockAuthService.login).toHaveBeenCalledTimes(1);
        });

        it('debería retornar un token JWT en la respuesta', async () => {
            mockAuthService.login.mockResolvedValue(expectedLoginResponse);

            const result = await controller.login(loginDto);

            expect(result).toHaveProperty('access_token');
            expect(result.access_token).toBeTruthy();
            expect(typeof result.access_token).toBe('string');
        });

        it('debería retornar información del usuario sin la contraseña', async () => {
            mockAuthService.login.mockResolvedValue(expectedLoginResponse);

            const result = await controller.login(loginDto);

            expect(result).toHaveProperty('usuario');
            expect(result.usuario).toHaveProperty('id');
            expect(result.usuario).toHaveProperty('nombre');
            expect(result.usuario).toHaveProperty('correo');
            expect(result.usuario).toHaveProperty('rol');
            expect(result.usuario).not.toHaveProperty('contrasena');
        });

        it('debería propagar UnauthorizedException si las credenciales son inválidas', async () => {
            mockAuthService.login.mockRejectedValue(
                new UnauthorizedException('Correo o contraseña inválidos'),
            );

            await expect(controller.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(controller.login(loginDto)).rejects.toThrow(
                'Correo o contraseña inválidos',
            );
        });

        it('debería propagar UnauthorizedException si el usuario está desactivado', async () => {
            mockAuthService.login.mockRejectedValue(
                new UnauthorizedException('Usuario desactivado'),
            );

            await expect(controller.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(controller.login(loginDto)).rejects.toThrow(
                'Usuario desactivado',
            );
        });

        it('debería manejar diferentes tipos de usuarios (ADMIN, CLIENTE)', async () => {
            const clienteResponse = {
                access_token: 'token-cliente',
                usuario: {
                    id: 2,
                    nombre: 'Cliente Juan',
                    correo: 'juan@test.com',
                    rol: 'CLIENTE',
                    telefono: '+56987654321',
                },
            };

            mockAuthService.login.mockResolvedValue(clienteResponse);

            const result = await controller.login({
                correo: 'juan@test.com',
                contrasena: '123456',
            });

            expect(result.usuario.rol).toBe('CLIENTE');
        });
    });

    describe('getProfile', () => {
        const mockUser = {
            sub: 1,
            correo: 'admin@tienda.com',
            nombre: 'Admin Principal',
            rol: 'ADMIN',
        };

        const mockProfile = {
            id: 1,
            nombre: 'Admin Principal',
            correo: 'admin@tienda.com',
            rol: 'ADMIN',
            telefono: '+56911112222',
            activo: true,
        };

        it('debería obtener el perfil del usuario autenticado', async () => {
            mockAuthService.getProfile.mockResolvedValue(mockProfile);

            const result = await controller.getProfile(mockUser);

            expect(result).toEqual(mockProfile);
            expect(mockAuthService.getProfile).toHaveBeenCalledWith(1);
            expect(mockAuthService.getProfile).toHaveBeenCalledTimes(1);
        });

        it('debería usar el ID del token JWT (user.sub)', async () => {
            mockAuthService.getProfile.mockResolvedValue(mockProfile);

            await controller.getProfile(mockUser);

            expect(mockAuthService.getProfile).toHaveBeenCalledWith(mockUser.sub);
        });

        it('debería manejar diferentes usuarios autenticados', async () => {
            const otherUser = { sub: 5, correo: 'otro@test.com', nombre: 'Otro', rol: 'CLIENTE' };
            const otherProfile = {
                id: 5,
                nombre: 'Otro Usuario',
                correo: 'otro@test.com',
                rol: 'CLIENTE',
                telefono: '+56999888777',
            };

            mockAuthService.getProfile.mockResolvedValue(otherProfile);

            const result = await controller.getProfile(otherUser);

            expect(result).toEqual(otherProfile);
            expect(mockAuthService.getProfile).toHaveBeenCalledWith(5);
        });

        it('debería propagar errores del servicio', async () => {
            mockAuthService.getProfile.mockRejectedValue(
                new Error('Usuario no encontrado'),
            );

            await expect(controller.getProfile(mockUser)).rejects.toThrow(
                'Usuario no encontrado',
            );
        });

        it('debería retornar null si el usuario no existe', async () => {
            mockAuthService.getProfile.mockResolvedValue(null);

            const result = await controller.getProfile({ sub: 999 });

            expect(result).toBeNull();
        });
    });
});