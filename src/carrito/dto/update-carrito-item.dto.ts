import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCarritoItemDto {
  @ApiProperty({
    example: 3,
    description: 'Nueva cantidad del producto',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  cantidad: number;
}
