import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class AddMemberDto {
  @ApiProperty({ example: 'user-uuid-here' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ enum: UserRole, example: 'MEMBER' })
  @IsEnum(UserRole)
  role: UserRole;
}
