import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TokenType } from '@prisma/client';

export class TokenFiltersDto {
  @ApiPropertyOptional({ enum: TokenType })
  @IsEnum(TokenType)
  @IsOptional()
  type?: TokenType;

  @ApiPropertyOptional({ example: 'brand' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'primary' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 50;
}
