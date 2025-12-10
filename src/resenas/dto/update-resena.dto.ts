import { IsInt, IsString, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class UpdateResenaDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  calificacion?: number;

  @IsOptional()
  @IsString()
  comentario?: string;

  @IsOptional()
  @IsBoolean()
  aprobada?: boolean;
}
