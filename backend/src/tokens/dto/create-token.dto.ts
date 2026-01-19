import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, MaxLength } from 'class-validator';
import { TokenType } from '@prisma/client';

export class CreateTokenDto {
  @ApiProperty({ example: 'primary-500' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '#6366f1' })
  @IsString()
  @IsNotEmpty({ message: 'Valor é obrigatório' })
  value: string;

  @ApiProperty({ enum: TokenType, example: 'COLOR' })
  @IsEnum(TokenType)
  type: TokenType;

  @ApiProperty({ example: 'brand' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiPropertyOptional({ example: 'Cor primária principal da marca' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'figma-var-123' })
  @IsString()
  @IsOptional()
  figmaVariableId?: string;
}
