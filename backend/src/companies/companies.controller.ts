import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar empresas do usuario' })
  @ApiResponse({ status: 200, description: 'Lista de empresas' })
  findAll(@Request() req) {
    return this.companiesService.findAll(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter empresa por ID' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada' })
  @ApiResponse({ status: 404, description: 'Empresa nao encontrada' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.companiesService.findOne(id, req.user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Criar nova empresa' })
  @ApiResponse({ status: 201, description: 'Empresa criada' })
  create(@Body() createCompanyDto: CreateCompanyDto, @Request() req) {
    return this.companiesService.create(createCompanyDto, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar empresa' })
  @ApiResponse({ status: 200, description: 'Empresa atualizada' })
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Request() req,
  ) {
    return this.companiesService.update(id, updateCompanyDto, req.user.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar empresa' })
  @ApiResponse({ status: 200, description: 'Empresa deletada' })
  remove(@Param('id') id: string, @Request() req) {
    return this.companiesService.remove(id, req.user.sub);
  }
}
