import { NodeData } from '@/components/ui/VisualBuilder/CanvasNode';
import { Connection } from '@/components/ui/VisualBuilder/ConnectionLine';

export interface ImportedStackData {
  name: string;
  description: string;
  nodes: Array<NodeData & {
    position: { x: number; y: number };
    width?: number;
    height?: number;
    documentation?: string;
  }>;
  connections: Connection[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ImportMetadata {
  version?: string;
  created?: string;
  totalSetupTime?: number;
  nodeCount?: number;
  connectionCount?: number;
  difficulties?: Record<string, number>;
}

// Formats de stack supportés
export type StackFormat = 'bluekit' | 'generic' | 'docker-compose' | 'terraform';

/**
 * Détecte le format du fichier JSON importé
 */
export const detectStackFormat = (data: unknown): StackFormat => {
  const stackData = data as Record<string, unknown>;
  // Format BlueKit.io natif
  if (stackData.metadata && (stackData.technologies || stackData.nodes) && stackData.connections) {
    return 'bluekit';
  }

  // Format Docker Compose
  if (stackData.version && stackData.services) {
    return 'docker-compose';
  }

  // Format Terraform
  if (stackData.terraform || stackData.provider || stackData.resource) {
    return 'terraform';
  }

  // Format générique
  return 'generic';
};

/**
 * Valide la structure d'une stack importée
 */
export const validateStackStructure = (data: unknown, format: StackFormat = 'generic'): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validation commune
  if (!data || typeof data !== 'object') {
    errors.push({
      field: 'root',
      message: 'Invalid file format - must be a valid JSON object',
      severity: 'error',
      suggestion: 'Ensure your file contains valid JSON structure'
    });
    return errors;
  }

  // Validation du nom
  if (!data.name || typeof data.name !== 'string') {
    errors.push({
      field: 'name',
      message: 'Stack name is required and must be a string',
      severity: 'error',
      suggestion: 'Add a "name" field with a descriptive stack name'
    });
  } else if (data.name.length > 100) {
    errors.push({
      field: 'name',
      message: 'Stack name is too long (max 100 characters)',
      severity: 'warning',
      suggestion: 'Consider shortening the stack name'
    });
  }

  // Validation de la description
  if (!data.description) {
    errors.push({
      field: 'description',
      message: 'Stack description is recommended for better documentation',
      severity: 'warning',
      suggestion: 'Add a "description" field to explain what this stack does'
    });
  } else if (typeof data.description !== 'string') {
    errors.push({
      field: 'description',
      message: 'Description must be a string',
      severity: 'warning'
    });
  }

  // Validation spécifique par format
  switch (format) {
    case 'bluekit':
      return [...errors, ...validateBlueKitFormat(data)];
    case 'docker-compose':
      return [...errors, ...validateDockerComposeFormat(data)];
    case 'terraform':
      return [...errors, ...validateTerraformFormat(data)];
    default:
      return [...errors, ...validateGenericFormat(data)];
  }
};

/**
 * Validation du format BlueKit natif
 */
const validateBlueKitFormat = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validation des technologies/nodes
  const technologies = data.technologies || data.nodes || [];
  if (!Array.isArray(technologies)) {
    errors.push({
      field: 'technologies',
      message: 'Technologies must be an array',
      severity: 'error',
      suggestion: 'Ensure "technologies" or "nodes" is an array of technology objects'
    });
  } else if (technologies.length === 0) {
    errors.push({
      field: 'technologies',
      message: 'Stack must contain at least one technology',
      severity: 'error',
      suggestion: 'Add at least one technology to your stack'
    });
  } else {
    technologies.forEach((tech: any, index: number) => {
      errors.push(...validateTechnologyNode(tech, index));
    });
  }

  // Validation des connections
  const connections = data.connections || [];
  if (!Array.isArray(connections)) {
    errors.push({
      field: 'connections',
      message: 'Connections must be an array',
      severity: 'warning',
      suggestion: 'Ensure "connections" is an array of connection objects'
    });
  } else {
    connections.forEach((conn: any, index: number) => {
      errors.push(...validateConnection(conn, index, technologies));
    });
  }

  return errors;
};

/**
 * Validation d'un nœud technologique
 */
const validateTechnologyNode = (tech: any, index: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  const techName = tech.name || `Technology ${index + 1}`;

  // Champs obligatoires
  if (!tech.id) {
    errors.push({
      field: `technologies[${index}].id`,
      message: `${techName} must have a unique ID`,
      severity: 'error',
      suggestion: 'Add a unique "id" field for each technology'
    });
  }

  if (!tech.name || typeof tech.name !== 'string') {
    errors.push({
      field: `technologies[${index}].name`,
      message: `Technology at index ${index} must have a name`,
      severity: 'error',
      suggestion: 'Add a "name" field with the technology name'
    });
  }

  // Champs recommandés
  if (!tech.category) {
    errors.push({
      field: `technologies[${index}].category`,
      message: `${techName} should have a category`,
      severity: 'warning',
      suggestion: 'Add a "category" field (e.g., "frontend", "backend", "database")'
    });
  } else {
    const validCategories = ['frontend', 'backend', 'database', 'devops', 'mobile', 'desktop', 'other'];
    if (!validCategories.includes(tech.category.toLowerCase())) {
      errors.push({
        field: `technologies[${index}].category`,
        message: `${techName} has unknown category "${tech.category}"`,
        severity: 'warning',
        suggestion: `Use one of: ${validCategories.join(', ')}`
      });
    }
  }

  if (!tech.description) {
    errors.push({
      field: `technologies[${index}].description`,
      message: `${techName} should have a description`,
      severity: 'warning',
      suggestion: 'Add a "description" field explaining what this technology does'
    });
  }

  // Validation des positions
  if (!tech.position) {
    errors.push({
      field: `technologies[${index}].position`,
      message: `${techName} missing position, will be auto-positioned`,
      severity: 'warning',
      suggestion: 'Add a "position" object with x and y coordinates'
    });
  } else {
    if (typeof tech.position.x !== 'number' || typeof tech.position.y !== 'number') {
      errors.push({
        field: `technologies[${index}].position`,
        message: `${techName} has invalid position coordinates`,
        severity: 'warning',
        suggestion: 'Position must have numeric x and y values'
      });
    }
    if (tech.position.x < 0 || tech.position.y < 0) {
      errors.push({
        field: `technologies[${index}].position`,
        message: `${techName} has negative position coordinates`,
        severity: 'warning',
        suggestion: 'Position coordinates should be positive'
      });
    }
  }

  // Validation des propriétés numériques
  if (tech.setupTimeHours !== undefined) {
    if (typeof tech.setupTimeHours !== 'number' || tech.setupTimeHours < 0) {
      errors.push({
        field: `technologies[${index}].setupTimeHours`,
        message: `${techName} has invalid setup time`,
        severity: 'warning',
        suggestion: 'Setup time must be a positive number'
      });
    }
  }

  // Validation de la difficulté
  if (tech.difficulty) {
    const validDifficulties = ['beginner', 'intermediate', 'expert'];
    if (!validDifficulties.includes(tech.difficulty)) {
      errors.push({
        field: `technologies[${index}].difficulty`,
        message: `${techName} has invalid difficulty level`,
        severity: 'warning',
        suggestion: `Use one of: ${validDifficulties.join(', ')}`
      });
    }
  }

  // Validation du pricing
  if (tech.pricing) {
    const validPricing = ['free', 'freemium', 'paid'];
    if (!validPricing.includes(tech.pricing)) {
      errors.push({
        field: `technologies[${index}].pricing`,
        message: `${techName} has invalid pricing model`,
        severity: 'warning',
        suggestion: `Use one of: ${validPricing.join(', ')}`
      });
    }
  }

  return errors;
};

/**
 * Validation d'une connexion
 */
const validateConnection = (conn: any, index: number, technologies: any[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!conn.id) {
    errors.push({
      field: `connections[${index}].id`,
      message: `Connection ${index + 1} should have a unique ID`,
      severity: 'warning',
      suggestion: 'Add a unique "id" field for each connection'
    });
  }

  const sourceId = conn.source || conn.sourceNodeId;
  const targetId = conn.target || conn.targetNodeId;

  if (!sourceId) {
    errors.push({
      field: `connections[${index}].source`,
      message: `Connection ${index + 1} missing source node`,
      severity: 'error',
      suggestion: 'Add a "source" or "sourceNodeId" field'
    });
  } else {
    // Vérifier que le nœud source existe
    const sourceExists = technologies.some(tech => tech.id === sourceId);
    if (!sourceExists) {
      errors.push({
        field: `connections[${index}].source`,
        message: `Connection ${index + 1} references non-existent source node "${sourceId}"`,
        severity: 'error',
        suggestion: 'Ensure the source node ID matches an existing technology ID'
      });
    }
  }

  if (!targetId) {
    errors.push({
      field: `connections[${index}].target`,
      message: `Connection ${index + 1} missing target node`,
      severity: 'error',
      suggestion: 'Add a "target" or "targetNodeId" field'
    });
  } else {
    // Vérifier que le nœud target existe
    const targetExists = technologies.some(tech => tech.id === targetId);
    if (!targetExists) {
      errors.push({
        field: `connections[${index}].target`,
        message: `Connection ${index + 1} references non-existent target node "${targetId}"`,
        severity: 'error',
        suggestion: 'Ensure the target node ID matches an existing technology ID'
      });
    }
  }

  // Éviter les self-connections
  if (sourceId && targetId && sourceId === targetId) {
    errors.push({
      field: `connections[${index}]`,
      message: `Connection ${index + 1} connects a node to itself`,
      severity: 'warning',
      suggestion: 'Connections should link different technologies'
    });
  }

  return errors;
};

/**
 * Validation du format générique
 */
const validateGenericFormat = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Rechercher des structures communes
  const possibleNodeArrays = [
    data.technologies,
    data.nodes,
    data.components,
    data.services,
    data.items
  ].filter(Boolean);

  if (possibleNodeArrays.length === 0) {
    errors.push({
      field: 'structure',
      message: 'No recognizable technology array found',
      severity: 'error',
      suggestion: 'Add a "technologies", "nodes", or "components" array'
    });
    return errors;
  }

  // Valider le premier array trouvé
  const technologies = possibleNodeArrays[0];
  if (!Array.isArray(technologies)) {
    errors.push({
      field: 'technologies',
      message: 'Technology list must be an array',
      severity: 'error'
    });
  } else if (technologies.length === 0) {
    errors.push({
      field: 'technologies',
      message: 'Stack must contain at least one technology',
      severity: 'error'
    });
  } else {
    // Validation basique des éléments
    technologies.forEach((tech: any, index: number) => {
      if (!tech.name && !tech.id) {
        errors.push({
          field: `technologies[${index}]`,
          message: `Item ${index + 1} needs at least a name or id`,
          severity: 'error'
        });
      }
    });
  }

  return errors;
};

/**
 * Validation du format Docker Compose (basique)
 */
const validateDockerComposeFormat = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.services) {
    errors.push({
      field: 'services',
      message: 'Docker Compose file must have a services section',
      severity: 'error'
    });
    return errors;
  }

  if (typeof data.services !== 'object') {
    errors.push({
      field: 'services',
      message: 'Services must be an object',
      severity: 'error'
    });
    return errors;
  }

  const serviceCount = Object.keys(data.services).length;
  if (serviceCount === 0) {
    errors.push({
      field: 'services',
      message: 'At least one service must be defined',
      severity: 'error'
    });
  }

  // Note: La conversion Docker Compose → BlueKit n'est pas encore implémentée
  errors.push({
    field: 'format',
    message: 'Docker Compose import is experimental',
    severity: 'warning',
    suggestion: 'Some features may not be fully supported'
  });

  return errors;
};

/**
 * Validation du format Terraform (basique)
 */
const validateTerraformFormat = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Note: La conversion Terraform → BlueKit n'est pas encore implémentée
  errors.push({
    field: 'format',
    message: 'Terraform import is not yet supported',
    severity: 'error',
    suggestion: 'Please convert your Terraform config to BlueKit JSON format'
  });

  return errors;
};

/**
 * Convertit les données importées vers le format interne BlueKit
 */
export const convertToInternalFormat = (data: unknown, format: StackFormat = 'generic'): ImportedStackData => {
  switch (format) {
    case 'bluekit':
      return convertBlueKitFormat(data);
    case 'docker-compose':
      return convertDockerComposeFormat(data);
    case 'terraform':
      return convertTerraformFormat(data);
    default:
      return convertGenericFormat(data);
  }
};

/**
 * Conversion du format BlueKit natif
 */
const convertBlueKitFormat = (data: any): ImportedStackData => {
  const technologies = data.technologies || data.nodes || [];
  
  const nodes = technologies.map((tech: any, index: number) => {
    const baseNode: NodeData & {
      position: { x: number; y: number };
      width?: number;
      height?: number;
      documentation?: string;
    } = {
      id: tech.id || `imported-${index}-${Date.now()}`,
      name: tech.name || `Technology ${index + 1}`,
      category: tech.category || 'other',
      description: tech.description || '',
      setupTimeHours: tech.setupTimeHours || tech.setupTime || 1,
      difficulty: (tech.difficulty as 'beginner' | 'intermediate' | 'expert') || 'beginner',
      pricing: (tech.pricing as 'free' | 'freemium' | 'paid') || 'free',
      isMainTechnology: tech.isMainTechnology !== false,
      position: tech.position || generateAutoPosition(index),
      width: tech.size?.width || tech.width || 200,
      height: tech.size?.height || tech.height || 80,
      documentation: tech.documentation || '',
      subTechnologies: tech.subTechnologies || [],
      compatibleWith: tech.compatibleWith || [],
      incompatibleWith: tech.incompatibleWith || []
    };

    return baseNode;
  });

  const connections = (data.connections || []).map((conn: any, index: number) => ({
    id: conn.id || `conn-${index}-${Date.now()}`,
    sourceNodeId: conn.source || conn.sourceNodeId,
    targetNodeId: conn.target || conn.targetNodeId,
    type: conn.type || 'default',
    style: conn.style || {}
  }));

  return {
    name: data.name || 'Imported Stack',
    description: data.description || 'Imported from BlueKit JSON file',
    nodes,
    connections
  };
};

/**
 * Conversion du format générique
 */
const convertGenericFormat = (data: any): ImportedStackData => {
  // Rechercher le meilleur array de technologies
  const technologies = data.technologies || data.nodes || data.components || data.services || data.items || [];
  
  const nodes = technologies.map((tech: any, index: number) => {
    const baseNode: NodeData & {
      position: { x: number; y: number };
      width?: number;
      height?: number;
      documentation?: string;
    } = {
      id: tech.id || tech.name?.toLowerCase().replace(/[^a-z0-9]/g, '-') || `imported-${index}-${Date.now()}`,
      name: tech.name || tech.title || tech.label || `Technology ${index + 1}`,
      category: inferCategory(tech.name, tech.category, tech.type) || 'other',
      description: tech.description || tech.desc || tech.summary || '',
      setupTimeHours: tech.setupTime || tech.installTime || 1,
      difficulty: inferDifficulty(tech.difficulty, tech.complexity) || 'beginner',
      pricing: inferPricing(tech.pricing, tech.cost, tech.price) || 'free',
      isMainTechnology: tech.main !== false && tech.primary !== false,
      position: tech.position || generateAutoPosition(index),
      width: tech.width || 200,
      height: tech.height || 80,
      documentation: tech.documentation || tech.docs || tech.readme || '',
      subTechnologies: [],
      compatibleWith: [],
      incompatibleWith: []
    };

    return baseNode;
  });

  // Essayer de déduire des connections basiques
  const connections: Connection[] = [];
  
  // Si il y a des dépendances explicites
  nodes.forEach((node, index) => {
    const originalTech = technologies[index];
    const deps = originalTech.dependencies || originalTech.dependsOn || originalTech.requires || [];
    
    deps.forEach((depName: string, depIndex: number) => {
      const targetNode = nodes.find(n => 
        n.name.toLowerCase().includes(depName.toLowerCase()) ||
        n.id === depName
      );
      
      if (targetNode) {
        connections.push({
          id: `auto-conn-${index}-${depIndex}-${Date.now()}`,
          sourceNodeId: node.id,
          targetNodeId: targetNode.id,
          type: 'default',
          style: {}
        });
      }
    });
  });

  return {
    name: data.name || data.title || 'Imported Stack',
    description: data.description || data.summary || 'Imported from generic JSON file',
    nodes,
    connections
  };
};

/**
 * Conversion Docker Compose (expérimental)
 */
const convertDockerComposeFormat = (data: any): ImportedStackData => {
  const services = data.services || {};
  const serviceNames = Object.keys(services);
  
  const nodes = serviceNames.map((serviceName, index) => {
    const service = services[serviceName];
    
    const baseNode: NodeData & {
      position: { x: number; y: number };
      width?: number;
      height?: number;
      documentation?: string;
    } = {
      id: serviceName,
      name: serviceName.charAt(0).toUpperCase() + serviceName.slice(1),
      category: inferCategoryFromDockerService(service),
      description: `Docker service: ${serviceName}`,
      setupTimeHours: 0.5,
      difficulty: 'intermediate' as const,
      pricing: 'free' as const,
      isMainTechnology: true,
      position: generateAutoPosition(index),
      width: 200,
      height: 80,
      documentation: `Image: ${service.image || 'custom'}\nPorts: ${(service.ports || []).join(', ') || 'none'}`,
      subTechnologies: [],
      compatibleWith: [],
      incompatibleWith: []
    };

    return baseNode;
  });

  // Générer des connections basées sur depends_on
  const connections: Connection[] = [];
  serviceNames.forEach((serviceName, index) => {
    const service = services[serviceName];
    const dependencies = service.depends_on || [];
    
    dependencies.forEach((depName: string, depIndex: number) => {
      connections.push({
        id: `docker-conn-${index}-${depIndex}-${Date.now()}`,
        sourceNodeId: serviceName,
        targetNodeId: depName,
        type: 'default',
        style: {}
      });
    });
  });

  return {
    name: data.name || 'Docker Stack',
    description: data.description || 'Imported from Docker Compose file',
    nodes,
    connections
  };
};

/**
 * Conversion Terraform (non implémentée)
 */
const convertTerraformFormat = (data: any): ImportedStackData => {
  throw new Error('Terraform import is not yet implemented');
};

/**
 * Génère une position automatique pour un nœud
 */
const generateAutoPosition = (index: number): { x: number; y: number } => {
  const cols = 4;
  const nodeWidth = 250;
  const nodeHeight = 150;
  const padding = 50;

  return {
    x: padding + (index % cols) * nodeWidth,
    y: padding + Math.floor(index / cols) * nodeHeight
  };
};

/**
 * Infère la catégorie d'une technologie
 */
const inferCategory = (name?: string, category?: string, type?: string): string => {
  if (category) return category.toLowerCase();
  if (type) return type.toLowerCase();
  if (!name) return 'other';

  const lowerName = name.toLowerCase();
  
  // Frontend
  if (lowerName.includes('react') || lowerName.includes('vue') || lowerName.includes('angular') ||
      lowerName.includes('frontend') || lowerName.includes('ui') || lowerName.includes('web')) {
    return 'frontend';
  }
  
  // Backend
  if (lowerName.includes('api') || lowerName.includes('server') || lowerName.includes('backend') ||
      lowerName.includes('node') || lowerName.includes('express') || lowerName.includes('django')) {
    return 'backend';
  }
  
  // Database
  if (lowerName.includes('db') || lowerName.includes('database') || lowerName.includes('sql') ||
      lowerName.includes('mongo') || lowerName.includes('postgres') || lowerName.includes('redis')) {
    return 'database';
  }
  
  return 'other';
};

/**
 * Infère la difficulté d'une technologie
 */
const inferDifficulty = (difficulty?: string, complexity?: string): 'beginner' | 'intermediate' | 'expert' => {
  const level = (difficulty || complexity || '').toLowerCase();
  
  if (level.includes('easy') || level.includes('simple') || level.includes('beginner')) {
    return 'beginner';
  }
  if (level.includes('hard') || level.includes('complex') || level.includes('expert') || level.includes('advanced')) {
    return 'expert';
  }
  return 'intermediate';
};

/**
 * Infère le modèle de pricing
 */
const inferPricing = (pricing?: string, cost?: string, price?: string): 'free' | 'freemium' | 'paid' => {
  const priceStr = (pricing || cost || price || '').toLowerCase();
  
  if (priceStr.includes('free') || priceStr.includes('open') || priceStr === '0' || priceStr === '') {
    return 'free';
  }
  if (priceStr.includes('freemium') || priceStr.includes('limited free')) {
    return 'freemium';
  }
  return 'paid';
};

/**
 * Infère la catégorie d'un service Docker
 */
const inferCategoryFromDockerService = (service: any): string => {
  const image = (service.image || '').toLowerCase();
  
  if (image.includes('postgres') || image.includes('mysql') || image.includes('mongo') || 
      image.includes('redis') || image.includes('elasticsearch')) {
    return 'database';
  }
  
  if (image.includes('nginx') || image.includes('apache') || image.includes('caddy')) {
    return 'frontend';
  }
  
  if (image.includes('node') || image.includes('python') || image.includes('java') || 
      image.includes('golang') || image.includes('api')) {
    return 'backend';
  }
  
  return 'devops';
};