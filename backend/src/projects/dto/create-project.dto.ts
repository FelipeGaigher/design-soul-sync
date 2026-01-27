import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength, IsUUID } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Design System Principal' })
  @IsString()
  @IsNotEmpty({ message: 'Nome e obrigatorio' })
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

  @ApiPropertyOptional({ example: 'https://www.figma.com/file/abc123/...' })
  @IsString()
  @IsOptional()
  figmaFileUrl?: string;

  @ApiPropertyOptional({ example: 'uuid-of-company' })
  @IsUUID()
  @IsOptional()
  companyId?: string;
}
