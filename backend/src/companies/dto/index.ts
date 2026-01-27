import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Onix Capital' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Design System da Onix Capital' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: 'Onix Capital' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Design System da Onix Capital' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsString()
  @IsOptional()
  logoUrl?: string;
}
