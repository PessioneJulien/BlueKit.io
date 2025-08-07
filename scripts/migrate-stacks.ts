import { createClient } from '@supabase/supabase-js';
import { officialStacks, additionalStacks } from '../lib/data/stacksData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Need service role key for admin operations

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateStacks() {
  console.log('Starting stack migration...');

  const allStacks = [...officialStacks, ...additionalStacks];
  
  for (const stack of allStacks) {
    try {
      console.log(`Migrating stack: ${stack.name}`);

      // Insert the main stack record
      const { data: newStack, error: stackError } = await supabase
        .from('stacks')
        .insert({
          name: stack.name,
          slug: stack.id, // Use the current id as slug
          description: stack.description,
          short_description: stack.shortDescription,
          category: stack.category,
          difficulty: stack.difficulty,
          setup_time_hours: stack.setupTimeHours,
          pricing: stack.pricing,
          author: stack.author,
          is_official: true,
        })
        .select()
        .single();

      if (stackError) {
        console.error(`Error inserting stack ${stack.name}:`, stackError);
        continue;
      }

      console.log(`✓ Inserted stack: ${newStack.name}`);

      // Insert technologies
      if (stack.technologies.length > 0) {
        const { error: techError } = await supabase
          .from('stack_technologies')
          .insert(
            stack.technologies.map(tech => ({
              stack_id: newStack.id,
              technology_id: tech.id,
              technology_name: tech.name,
              category: tech.category,
              role: tech.role,
            }))
          );

        if (techError) {
          console.error(`Error inserting technologies for ${stack.name}:`, techError);
        } else {
          console.log(`✓ Inserted ${stack.technologies.length} technologies`);
        }
      }

      // Insert use cases
      if (stack.useCases.length > 0) {
        const { error: useCaseError } = await supabase
          .from('stack_use_cases')
          .insert(
            stack.useCases.map(useCase => ({
              stack_id: newStack.id,
              use_case: useCase,
            }))
          );

        if (useCaseError) {
          console.error(`Error inserting use cases for ${stack.name}:`, useCaseError);
        } else {
          console.log(`✓ Inserted ${stack.useCases.length} use cases`);
        }
      }

      // Insert pros
      if (stack.pros.length > 0) {
        const { error: prosError } = await supabase
          .from('stack_pros')
          .insert(
            stack.pros.map(pro => ({
              stack_id: newStack.id,
              pro: pro,
            }))
          );

        if (prosError) {
          console.error(`Error inserting pros for ${stack.name}:`, prosError);
        } else {
          console.log(`✓ Inserted ${stack.pros.length} pros`);
        }
      }

      // Insert cons
      if (stack.cons.length > 0) {
        const { error: consError } = await supabase
          .from('stack_cons')
          .insert(
            stack.cons.map(con => ({
              stack_id: newStack.id,
              con: con,
            }))
          );

        if (consError) {
          console.error(`Error inserting cons for ${stack.name}:`, consError);
        } else {
          console.log(`✓ Inserted ${stack.cons.length} cons`);
        }
      }

      // Insert installation steps
      if (stack.installationSteps.length > 0) {
        const { error: stepsError } = await supabase
          .from('stack_installation_steps')
          .insert(
            stack.installationSteps.map((step, index) => ({
              stack_id: newStack.id,
              step_number: index + 1,
              step_description: step,
            }))
          );

        if (stepsError) {
          console.error(`Error inserting installation steps for ${stack.name}:`, stepsError);
        } else {
          console.log(`✓ Inserted ${stack.installationSteps.length} installation steps`);
        }
      }

      // Insert alternatives
      if (stack.alternatives.length > 0) {
        const { error: alternativesError } = await supabase
          .from('stack_alternatives')
          .insert(
            stack.alternatives.map(alternative => ({
              stack_id: newStack.id,
              alternative: alternative,
            }))
          );

        if (alternativesError) {
          console.error(`Error inserting alternatives for ${stack.name}:`, alternativesError);
        } else {
          console.log(`✓ Inserted ${stack.alternatives.length} alternatives`);
        }
      }

      // Create some sample usage stats based on the original uses count
      const usageCount = Math.floor(stack.uses * 0.3); // Convert to more realistic click-through numbers
      if (usageCount > 0) {
        const usageStats = [];
        for (let i = 0; i < usageCount; i++) {
          usageStats.push({
            stack_id: newStack.id,
            session_id: `migration_${Date.now()}_${i}`,
            clicked_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
          });
        }

        const { error: usageError } = await supabase
          .from('stack_usage_stats')
          .insert(usageStats);

        if (usageError) {
          console.error(`Error inserting usage stats for ${stack.name}:`, usageError);
        } else {
          console.log(`✓ Inserted ${usageCount} usage stats`);
        }
      }

      console.log(`✅ Successfully migrated stack: ${stack.name}\n`);

    } catch (error) {
      console.error(`Error migrating stack ${stack.name}:`, error);
    }
  }

  console.log('Stack migration completed!');
}

// Run the migration
migrateStacks().catch(console.error);