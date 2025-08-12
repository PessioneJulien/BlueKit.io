import { serverStacksApi } from '@/lib/api/stacks';
import { getAllStacks, type StackData } from '@/lib/data/stacksData';
import type { CreateStackRequest, TechnologyCategory } from '@/lib/types/database-models';
import { createServerClient } from '@/lib/supabase/server';

export class DataMigrationService {
  private async createClient() {
    return await createServerClient();
  }

  /**
   * Migrate all hardcoded stacks to the database
   */
  async migrateStacksToDatabase(): Promise<{
    success: number;
    errors: Array<{ stackId: string; error: string }>;
    total: number;
  }> {
    console.log('Starting stack migration to database...');
    
    const hardcodedStacks = getAllStacks();
    let successCount = 0;
    const errors: Array<{ stackId: string; error: string }> = [];
    
    for (const hardcodedStack of hardcodedStacks) {
      try {
        console.log(`Migrating stack: ${hardcodedStack.name}`);
        
        // Check if stack already exists by name
        const existingStacks = await serverStacksApi.getStacks({
          search: hardcodedStack.name,
          limit: 1
        });
        
        if (existingStacks.data.length > 0) {
          console.log(`Stack "${hardcodedStack.name}" already exists, skipping...`);
          continue;
        }
        
        // Convert hardcoded stack to database format
        const createRequest = this.convertHardcodedStackToCreateRequest(hardcodedStack);
        
        // Create the stack in database
        await serverStacksApi.createStack(createRequest);
        
        successCount++;
        console.log(`Successfully migrated: ${hardcodedStack.name}`);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Failed to migrate stack "${hardcodedStack.name}":`, errorMessage);
        
        errors.push({
          stackId: hardcodedStack.id,
          error: errorMessage
        });
      }
    }
    
    console.log(`Migration completed: ${successCount}/${hardcodedStacks.length} stacks migrated successfully`);
    
    return {
      success: successCount,
      errors,
      total: hardcodedStacks.length
    };
  }

  /**
   * Clear all stacks from the database (BE CAREFUL!)
   */
  async clearAllStacks(): Promise<number> {
    console.log('WARNING: Clearing all stacks from database...');
    
    const supabase = await this.createClient();
    const { data, error } = await supabase
      .from('stacks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except impossible ID
    
    if (error) {
      throw new Error(`Failed to clear stacks: ${error.message}`);
    }
    
    console.log('All stacks cleared from database');
    return data?.length || 0;
  }

  /**
   * Validate database schema and check if all required tables exist
   */
  async validateDatabaseSchema(): Promise<{
    valid: boolean;
    missingTables: string[];
    errors: string[];
  }> {
    const requiredTables = [
      'stacks',
      'stack_technologies', 
      'stack_use_cases',
      'stack_pros',
      'stack_cons',
      'stack_installation_steps',
      'stack_alternatives',
      'stack_usage_stats'
    ];
    
    const missingTables: string[] = [];
    const errors: string[] = [];
    
    for (const table of requiredTables) {
      try {
        const supabase = await this.createClient();
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error && error.code === '42P01') { // Table doesn't exist
          missingTables.push(table);
        } else if (error) {
          errors.push(`Table ${table}: ${error.message}`);
        }
      } catch (error) {
        errors.push(`Table ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return {
      valid: missingTables.length === 0 && errors.length === 0,
      missingTables,
      errors
    };
  }

  /**
   * Get migration status - how many hardcoded vs database stacks
   */
  async getMigrationStatus(): Promise<{
    hardcodedStacks: number;
    databaseStacks: number;
    migrationNeeded: boolean;
  }> {
    const hardcodedStacks = getAllStacks().length;
    
    const databaseResult = await serverStacksApi.getStacks({ limit: 1000 });
    const databaseStacks = databaseResult.pagination.total;
    
    return {
      hardcodedStacks,
      databaseStacks,
      migrationNeeded: databaseStacks < hardcodedStacks
    };
  }

  /**
   * Create database tables if they don't exist (run schema.sql)
   */
  async createDatabaseSchema(): Promise<void> {
    // This would ideally run the schema.sql file
    // For now, we'll assume the schema is already created via Supabase migrations
    console.log('Database schema creation should be done via Supabase migrations');
    console.log('Please run the schema.sql file in Supabase SQL editor');
  }

  // Private helper methods

  private convertHardcodedStackToCreateRequest(hardcodedStack: StackData): CreateStackRequest {
    return {
      name: hardcodedStack.name,
      description: hardcodedStack.description,
      short_description: hardcodedStack.shortDescription,
      category: hardcodedStack.category,
      difficulty: hardcodedStack.difficulty,
      setup_time_hours: hardcodedStack.setupTimeHours,
      pricing: hardcodedStack.pricing,
      technologies: hardcodedStack.technologies.map(tech => ({
        id: tech.id,
        name: tech.name,
        category: tech.category as TechnologyCategory,
        role: tech.role
      })),
      use_cases: hardcodedStack.useCases,
      pros: hardcodedStack.pros,
      cons: hardcodedStack.cons,
      installation_steps: hardcodedStack.installationSteps,
      alternatives: hardcodedStack.alternatives
    };
  }

  /**
   * Sync a single stack from hardcoded data to database
   */
  async syncStack(stackId: string): Promise<void> {
    const hardcodedStacks = getAllStacks();
    const hardcodedStack = hardcodedStacks.find(s => s.id === stackId);
    
    if (!hardcodedStack) {
      throw new Error(`Hardcoded stack with ID ${stackId} not found`);
    }
    
    // Check if already exists in database
    const existingStack = await serverStacksApi.getStack(stackId);
    
    const createRequest = this.convertHardcodedStackToCreateRequest(hardcodedStack);
    
    if (existingStack) {
      // Update existing stack
      await serverStacksApi.updateStack(stackId, createRequest);
      console.log(`Updated stack: ${hardcodedStack.name}`);
    } else {
      // Create new stack
      await serverStacksApi.createStack(createRequest);
      console.log(`Created stack: ${hardcodedStack.name}`);
    }
  }

  /**
   * Generate SQL INSERT statements for hardcoded data (for manual insertion)
   */
  generateSQLInserts(): string {
    const hardcodedStacks = getAllStacks();
    let sql = '-- Generated SQL inserts for hardcoded stacks\n\n';
    
    for (const stack of hardcodedStacks) {
      const slug = this.createSlug(stack.name);
      
      // Stack insert
      sql += `INSERT INTO stacks (id, name, slug, description, short_description, category, difficulty, setup_time_hours, pricing, author, is_official, created_at, updated_at) VALUES\n`;
      sql += `('${stack.id}', '${this.escapeSql(stack.name)}', '${slug}', '${this.escapeSql(stack.description)}', '${this.escapeSql(stack.shortDescription)}', '${stack.category}', '${stack.difficulty}', ${stack.setupTimeHours}, '${stack.pricing}', '${this.escapeSql(stack.author)}', true, '${stack.createdAt}T00:00:00Z', '${stack.createdAt}T00:00:00Z');\n\n`;
      
      // Technologies
      for (const tech of stack.technologies) {
        sql += `INSERT INTO stack_technologies (stack_id, technology_id, technology_name, category, role) VALUES ('${stack.id}', '${tech.id}', '${this.escapeSql(tech.name)}', '${tech.category}', '${tech.role}');\n`;
      }
      
      // Use cases
      for (const useCase of stack.useCases) {
        sql += `INSERT INTO stack_use_cases (stack_id, use_case) VALUES ('${stack.id}', '${this.escapeSql(useCase)}');\n`;
      }
      
      // Pros
      for (const pro of stack.pros) {
        sql += `INSERT INTO stack_pros (stack_id, pro) VALUES ('${stack.id}', '${this.escapeSql(pro)}');\n`;
      }
      
      // Cons
      for (const con of stack.cons) {
        sql += `INSERT INTO stack_cons (stack_id, con) VALUES ('${stack.id}', '${this.escapeSql(con)}');\n`;
      }
      
      // Installation steps
      for (let i = 0; i < stack.installationSteps.length; i++) {
        sql += `INSERT INTO stack_installation_steps (stack_id, step_number, step_description) VALUES ('${stack.id}', ${i + 1}, '${this.escapeSql(stack.installationSteps[i])}');\n`;
      }
      
      // Alternatives
      for (const alt of stack.alternatives) {
        sql += `INSERT INTO stack_alternatives (stack_id, alternative) VALUES ('${stack.id}', '${this.escapeSql(alt)}');\n`;
      }
      
      sql += '\n';
    }
    
    return sql;
  }

  private createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private escapeSql(str: string): string {
    return str.replace(/'/g, "''");
  }
}

// Singleton instance
export const dataMigrationService = new DataMigrationService();