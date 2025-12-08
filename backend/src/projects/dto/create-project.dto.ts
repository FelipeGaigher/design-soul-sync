import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Design System Principal' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Design System da empresa para todos os produtos' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'abc123xyz' })
  @IsString()
  @IsOptional()
  figmaFileId?: string;
}
