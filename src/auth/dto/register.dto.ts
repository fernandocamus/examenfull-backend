import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { RolUsuario } from '../../usuarios/entities/usuario.entity';

export class RegisterDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    example: 'juan@example.com',
    description: 'Correo electrónico del usuario',
  })
  @IsEmail()
  correo: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  contrasena: string;

  @ApiPropertyOptional({
    example: '+56912345678',
    description: 'Número de teléfono del usuario',
  })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({
    example: 'CLIENTE',
    description: 'Rol del usuario en el sistema',
    enum: RolUsuario,
    default: RolUsuario.CLIENTE,
  })
  @IsOptional()
  @IsEnum(RolUsuario)
  @IsNotEmpty()
  rol?: RolUsuario;
}
