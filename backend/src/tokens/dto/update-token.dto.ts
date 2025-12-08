import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { TokenType } from '@prisma/client';

export class UpdateTokenDto {
  @ApiPropertyOptional({ example: 'primary-600' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: '#4f46e5' })
  @IsString()
  @IsOptional()
  value?: string;

  @ApiPropertyOptional({ enum: TokenType })
  @IsEnum(TokenType)
  @IsOptional()
  type?: TokenType;

  @ApiPropertyOptional({ example: 'brand' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'Cor primária atualizada' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
