import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { contrasena, correo, nombre, telefono, rol } = registerDto;

    const userExists = await this.usuariosService.findOneByEmail(correo);
    if (userExists) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const hashedPassword = await bcryptjs.hash(contrasena, 10);

    await this.usuariosService.create({
      nombre,
      correo,
      contrasena: hashedPassword,
      telefono,
      rol,
    });

    return {
      message: 'Usuario registrado exitosamente',
    };
  }

  async login(loginDto: LoginDto) {
    const { correo, contrasena } = loginDto;

    const user = await this.usuariosService.findOneByEmailWithPassword(correo);
    if (!user) {
      throw new UnauthorizedException('Correo o contraseña inválidos');
    }

    if (!user.activo) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    const isPasswordValid = await bcryptjs.compare(contrasena, user.contrasena);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Correo o contraseña inválidos');
    }

    const payload = {
      sub: user.id,
      correo: user.correo,
      nombre: user.nombre,
      rol: user.rol,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol,
        telefono: user.telefono,
      },
    };
  }

  async getProfile(userId: number) {
    return await this.usuariosService.findOne(userId);
  }
}
