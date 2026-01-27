import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ComponentsService } from './components.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects/:projectId/components')
@UseGuards(JwtAuthGuard)
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Get()
  async getProjectComponents(@Param('projectId') projectId: string) {
    return await this.componentsService.findByProject(projectId);
  }

  @Get(':componentId')
  async getComponent(@Param('componentId') componentId: string) {
    return await this.componentsService.findOne(componentId);
  }

  @Get(':componentId/code')
  async generateCode(
    @Param('componentId') componentId: string,
    @Query('framework') framework: 'react' | 'vue' | 'angular',
  ) {
    return await this.componentsService.generateCode(
      componentId,
      framework || 'react',
    );
  }
}
