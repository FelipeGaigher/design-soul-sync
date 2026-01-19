import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateTokenDto } from './create-token.dto';

export class BulkCreateTokensDto {
  @ApiProperty({ type: [CreateTokenDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTokenDto)
  tokens: CreateTokenDto[];
}
