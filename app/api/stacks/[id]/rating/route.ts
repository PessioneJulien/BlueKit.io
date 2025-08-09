import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Récupérer le rating d'une stack et les avis utilisateurs
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const stackId = params.id;

    // Récupérer tous les ratings pour cette stack
    const { data: ratings, error } = await supabase
      .from('stack_ratings')
      .select(`
        id,
        rating,
        comment,
        created_at,
        user_id,
        users:user_id (
          id,
          email,
          user_metadata
        )
      `)
      .eq('stack_id', stackId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ratings:', error);
      return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 });
    }

    // Calculer la moyenne et les statistiques
    const totalRatings = ratings?.length || 0;
    const averageRating = totalRatings > 0 
      ? ratings!.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;

    // Compter les ratings par étoile
    const ratingCounts = {
      5: ratings?.filter(r => r.rating === 5).length || 0,
      4: ratings?.filter(r => r.rating === 4).length || 0,
      3: ratings?.filter(r => r.rating === 3).length || 0,
      2: ratings?.filter(r => r.rating === 2).length || 0,
      1: ratings?.filter(r => r.rating === 1).length || 0,
    };

    return NextResponse.json({
      averageRating: Number(averageRating.toFixed(1)),
      totalRatings,
      ratingCounts,
      ratings: ratings || []
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Ajouter ou mettre à jour un rating
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const stackId = params.id;

    // Vérifier que l'utilisateur est authentifié
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { rating, comment } = await request.json();

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Vérifier si l'utilisateur a déjà noté cette stack
    const { data: existingRating, error: checkError } = await supabase
      .from('stack_ratings')
      .select('id')
      .eq('stack_id', stackId)
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing rating:', checkError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    let result;

    if (existingRating) {
      // Mettre à jour le rating existant
      const { data, error: updateError } = await supabase
        .from('stack_ratings')
        .update({
          rating,
          comment: comment || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRating.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating rating:', updateError);
        return NextResponse.json({ error: 'Failed to update rating' }, { status: 500 });
      }

      result = data;
    } else {
      // Créer un nouveau rating
      const { data, error: insertError } = await supabase
        .from('stack_ratings')
        .insert({
          stack_id: stackId,
          user_id: user.id,
          rating,
          comment: comment || null
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating rating:', insertError);
        return NextResponse.json({ error: 'Failed to create rating' }, { status: 500 });
      }

      result = data;
    }

    // Mettre à jour la moyenne dans la table stacks
    await updateStackAverageRating(supabase, stackId);

    return NextResponse.json({ 
      success: true, 
      rating: result,
      message: existingRating ? 'Rating updated successfully' : 'Rating created successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Supprimer un rating
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const stackId = params.id;

    // Vérifier que l'utilisateur est authentifié
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Supprimer le rating de l'utilisateur pour cette stack
    const { error: deleteError } = await supabase
      .from('stack_ratings')
      .delete()
      .eq('stack_id', stackId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting rating:', deleteError);
      return NextResponse.json({ error: 'Failed to delete rating' }, { status: 500 });
    }

    // Mettre à jour la moyenne dans la table stacks
    await updateStackAverageRating(supabase, stackId);

    return NextResponse.json({ success: true, message: 'Rating deleted successfully' });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Fonction utilitaire pour mettre à jour la moyenne des ratings dans la table stacks
async function updateStackAverageRating(supabase: Awaited<ReturnType<typeof createClient>>, stackId: string) {
  const { data: ratings, error } = await supabase
    .from('stack_ratings')
    .select('rating')
    .eq('stack_id', stackId);

  if (error) {
    console.error('Error fetching ratings for average:', error);
    return;
  }

  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / ratings.length 
    : 0;

  const { error: updateError } = await supabase
    .from('stacks')
    .update({ 
      rating: Number(averageRating.toFixed(1)),
      rating_count: ratings.length 
    })
    .eq('id', stackId);

  if (updateError) {
    console.error('Error updating stack average rating:', updateError);
  }
}