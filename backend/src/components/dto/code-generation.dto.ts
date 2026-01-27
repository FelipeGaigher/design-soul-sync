import { IsEnum } from 'class-validator';

export class GenerateCodeDto {
  @IsEnum(['react', 'vue', 'angular'])
  framework: 'react' | 'vue' | 'angular';
}

export interface GeneratedCodeResponseDto {
  code: string;
  language: string;
}
