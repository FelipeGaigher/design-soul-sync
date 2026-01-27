export interface ComponentResponseDto {
  id: string;
  name: string;
  nodeId: string | null;
  previewUrl?: string | null;
  description?: string | null;
  status: 'ok' | 'modified' | 'broken' | 'unauthorized';
}

export interface FolderResponseDto {
  name: string;
  components: ComponentResponseDto[];
}

export interface ProjectComponentsResponseDto {
  id: string;
  name: string;
  figmaUrl: string;
  folders: FolderResponseDto[];
  lastImportedAt: string;
  companyName?: string;
  alertsCount: number;
}
