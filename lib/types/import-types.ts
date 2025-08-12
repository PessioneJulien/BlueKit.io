import { NodeData } from '@/components/ui/VisualBuilder/CanvasNode';
import { Connection } from '@/components/ui/VisualBuilder/ConnectionLine';

// Types pour les données importées
export interface ImportedStackData {
  name: string;
  description: string;
  nodes: ImportedNode[];
  connections: ImportedConnection[];
  metadata?: ImportMetadata;
}

export interface ImportedNode extends NodeData {
  position: { x: number; y: number };
  width?: number;
  height?: number;
  documentation?: string;
}

export interface ImportedConnection extends Connection {
  // Extensions possibles pour les connections importées
}

export interface ImportMetadata {
  version?: string;
  created?: string;
  updated?: string;
  author?: string;
  totalSetupTime?: number;
  nodeCount?: number;
  connectionCount?: number;
  difficulties?: {
    beginner?: number;
    intermediate?: number;
    expert?: number;
  };
  categories?: Record<string, number>;
  format?: StackFormat;
  originalFormat?: string;
}

// Formats de stack supportés
export type StackFormat = 'bluekit' | 'generic' | 'docker-compose' | 'terraform' | 'k8s' | 'unknown';

// Erreurs de validation
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
  line?: number;
  column?: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  format: StackFormat;
  metadata?: ImportMetadata;
}

// États du processus d'import
export type ImportState = 
  | 'idle'           // Attente du fichier
  | 'uploading'      // Upload en cours
  | 'validating'     // Validation en cours  
  | 'converting'     // Conversion en cours
  | 'preview'        // Prévisualisation
  | 'importing'      // Import en cours
  | 'success'        // Import réussi
  | 'error';         // Erreur

export interface ImportProgress {
  state: ImportState;
  progress: number; // 0-100
  currentStep?: string;
  totalSteps?: number;
  completedSteps?: number;
}

// Configuration d'import
export interface ImportConfig {
  autoPositioning: boolean;
  preserveIds: boolean;
  validateConnections: boolean;
  allowWarnings: boolean;
  mergeWithCurrent: boolean;
  defaultCategory?: string;
  positionOffset?: { x: number; y: number };
}

// Formats de fichiers spécifiques

// Format BlueKit natif
export interface BlueKitStackFormat {
  name: string;
  description: string;
  version: string;
  created: string;
  metadata: ImportMetadata;
  technologies: BlueKitTechnology[];
  connections: BlueKitConnection[];
}

export interface BlueKitTechnology {
  id: string;
  name: string;
  category: string;
  description: string;
  setupTimeHours: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  pricing: 'free' | 'freemium' | 'paid';
  position: { x: number; y: number };
  size: { width: number; height: number };
  documentation?: string;
  isMainTechnology: boolean;
  subTechnologies?: SubTechnology[];
  compatibleWith?: string[];
  incompatibleWith?: string[];
  logoUrl?: string;
  officialDocsUrl?: string;
  githubUrl?: string;
  tags?: string[];
}

export interface SubTechnology {
  name: string;
  type: 'tool' | 'library' | 'plugin' | 'extension';
  description?: string;
  required?: boolean;
}

export interface BlueKitConnection {
  id: string;
  source: string;
  target: string;
  type: 'default' | 'data-flow' | 'dependency' | 'api-call';
  style?: {
    strokeWidth?: number;
    strokeColor?: string;
    strokeDasharray?: string;
    animated?: boolean;
  };
  label?: string;
  metadata?: Record<string, any>;
}

// Format Docker Compose
export interface DockerComposeFormat {
  version: string;
  services: Record<string, DockerService>;
  networks?: Record<string, DockerNetwork>;
  volumes?: Record<string, DockerVolume>;
  configs?: Record<string, DockerConfig>;
  secrets?: Record<string, DockerSecret>;
}

export interface DockerService {
  image?: string;
  build?: string | DockerBuildConfig;
  ports?: string[];
  environment?: Record<string, string> | string[];
  volumes?: string[];
  depends_on?: string[] | Record<string, DockerDependency>;
  networks?: string[] | Record<string, DockerServiceNetwork>;
  restart?: string;
  command?: string | string[];
  entrypoint?: string | string[];
  working_dir?: string;
  user?: string;
  labels?: Record<string, string>;
  healthcheck?: DockerHealthcheck;
  deploy?: DockerDeploy;
}

export interface DockerBuildConfig {
  context: string;
  dockerfile?: string;
  args?: Record<string, string>;
  target?: string;
}

export interface DockerDependency {
  condition: 'service_started' | 'service_healthy' | 'service_completed_successfully';
}

export interface DockerServiceNetwork {
  aliases?: string[];
  ipv4_address?: string;
  ipv6_address?: string;
}

export interface DockerNetwork {
  driver?: string;
  driver_opts?: Record<string, string>;
  external?: boolean | { name: string };
}

export interface DockerVolume {
  driver?: string;
  driver_opts?: Record<string, string>;
  external?: boolean | { name: string };
}

export interface DockerConfig {
  file?: string;
  external?: boolean | { name: string };
}

export interface DockerSecret {
  file?: string;
  external?: boolean | { name: string };
}

export interface DockerHealthcheck {
  test: string | string[];
  interval?: string;
  timeout?: string;
  retries?: number;
  start_period?: string;
}

export interface DockerDeploy {
  replicas?: number;
  resources?: {
    limits?: { cpus?: string; memory?: string };
    reservations?: { cpus?: string; memory?: string };
  };
  restart_policy?: {
    condition?: string;
    delay?: string;
    max_attempts?: number;
    window?: string;
  };
}

// Format Kubernetes (futur)
export interface KubernetesFormat {
  apiVersion: string;
  kind: string;
  metadata: K8sMetadata;
  spec?: any;
}

export interface K8sMetadata {
  name: string;
  namespace?: string;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

// Format Terraform (futur)
export interface TerraformFormat {
  terraform?: TerraformConfig;
  provider?: Record<string, TerraformProvider>;
  resource?: Record<string, Record<string, TerraformResource>>;
  data?: Record<string, Record<string, TerraformDataSource>>;
  variable?: Record<string, TerraformVariable>;
  output?: Record<string, TerraformOutput>;
}

export interface TerraformConfig {
  required_version?: string;
  required_providers?: Record<string, TerraformRequiredProvider>;
  backend?: Record<string, any>;
}

export interface TerraformProvider {
  version?: string;
  source?: string;
  [key: string]: any;
}

export interface TerraformResource {
  [key: string]: any;
}

export interface TerraformDataSource {
  [key: string]: any;
}

export interface TerraformVariable {
  description?: string;
  type?: string;
  default?: any;
  validation?: TerraformVariableValidation[];
}

export interface TerraformVariableValidation {
  condition: string;
  error_message: string;
}

export interface TerraformOutput {
  value: string;
  description?: string;
  sensitive?: boolean;
}

// Utilitaires pour la détection de format
export interface FormatDetectionResult {
  format: StackFormat;
  confidence: number; // 0-1
  indicators: string[];
  version?: string;
}

// Options d'export compatibles
export interface ExportCompatibility {
  supportedFormats: StackFormat[];
  currentFormat: StackFormat;
  canExport: (format: StackFormat) => boolean;
  getExportOptions: (format: StackFormat) => ExportOptions;
}

export interface ExportOptions {
  includeMetadata: boolean;
  includePositions: boolean;
  includeConnections: boolean;
  includeDocumentation: boolean;
  compressionLevel?: number;
  formatVersion?: string;
}