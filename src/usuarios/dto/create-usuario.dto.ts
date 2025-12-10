import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { RolUsuario } from '../entities/usuario.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({
    example: 'Alfredo Camus',
    description: 'Nombre del usuario.',
  })
  @IsString()
  @MinLength(3)
  nombre: string;

  @ApiProperty({
    example: 'alfcamus@gmail.com',
    description: 'Correo del usuario.',
  })
  @IsEmail()
  correo: string;

  @ApiProperty({
    example: 'pass123456',
    description: 'Contrasena del usuario.',
  })
  @IsString()
  @MinLength(6)
  contrasena: string;

  @ApiProperty({
    example: 'CLIENTE',
    description: 'Rol del usuario.',
  })
  @IsOptional()
  @IsEnum(RolUsuario)
  rol?: RolUsuario;

  @ApiProperty({
    example: '+56912345678',
    description: 'Telefono del usuario.',
  })
  @IsOptional()
  @IsString()
  telefono?: string;
}
