import { PartialType } from '@nestjs/mapped-types';
import { CreateDireccionEnvioDto } from './create-direccion-envio.dto';

export class UpdateDireccionEnvioDto extends PartialType(CreateDireccionEnvioDto) {}
