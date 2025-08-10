'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { X, User, MessageSquare, Calendar, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingData {
  averageRating: number;
  totalRatings: number;
  ratingCounts: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  ratings: Array<{
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    user_id: string;
    users: {
      id: string;
      email: string;
      user_metadata: {
        full_name?: string;
        name?: string;
        avatar_url?: string;
      };
    };
  }>;
}

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  stackId: string;
  stackName: string;
  currentUser?: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
      name?: string;
    };
  };
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  stackId,
  stackName,
  currentUser
}) => {
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [activeTab, setActiveTab] = useState<'rate' | 'reviews'>('rate');

  // Charger les données de rating
  useEffect(() => {
    if (isOpen) {
      loadRatingData();
    }
  }, [isOpen, stackId]); // loadRatingData ne change pas, pas besoin de l'ajouter

  const loadRatingData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/stacks/${stackId}/rating`);
      if (response.ok) {
        const data = await response.json();
        setRatingData(data);
        
        // Si l'utilisateur a déjà noté, pré-remplir le formulaire
        if (currentUser) {
          const existingRating = data.ratings.find(
            (r) => r.user_id === currentUser.id
          );
          if (existingRating) {
            setUserRating(existingRating.rating);
            setUserComment(existingRating.comment || '');
          }
        }
      }
    } catch (error) {
      console.error('Error loading rating data:', error);
    }
    setLoading(false);
  };

  const handleSubmitRating = async () => {
    if (!currentUser) {
      alert('Vous devez être connecté pour noter cette stack');
      return;
    }

    if (userRating === 0) {
      alert('Veuillez sélectionner une note');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/stacks/${stackId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: userRating,
          comment: userComment.trim() || null
        })
      });

      if (response.ok) {
        await loadRatingData(); // Recharger les données
        setActiveTab('reviews'); // Switcher vers les avis
      } else {
        const error = await response.json();
        alert(error.message || 'Erreur lors de la soumission');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Erreur lors de la soumission');
    }
    setSubmitting(false);
  };

  const handleDeleteRating = async () => {
    if (!currentUser || !confirm('Êtes-vous sûr de vouloir supprimer votre avis ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/stacks/${stackId}/rating`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setUserRating(0);
        setUserComment('');
        await loadRatingData();
      }
    } catch (error) {
      console.error('Error deleting rating:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserDisplayName = (user: {
    user_metadata?: {
      full_name?: string;
      name?: string;
    };
    email?: string;
  }) => {
    return user.user_metadata?.full_name || 
           user.user_metadata?.name || 
           user.email?.split('@')[0] || 
           'Utilisateur';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-slate-900 rounded-xl border border-slate-700 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div>
              <h2 className="text-xl font-bold text-white">Évaluer la stack</h2>
              <p className="text-slate-400 mt-1">{stackName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveTab('rate')}
              className={cn(
                'flex-1 px-6 py-3 text-sm font-medium transition-colors',
                activeTab === 'rate'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Noter
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={cn(
                'flex-1 px-6 py-3 text-sm font-medium transition-colors',
                activeTab === 'reviews'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              Avis ({ratingData?.totalRatings || 0})
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[400px] overflow-y-auto">
            {activeTab === 'rate' && (
              <div className="p-6 space-y-6">
                {/* Rating Summary */}
                {ratingData && (
                  <div className="bg-slate-800/30 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">
                          {ratingData.averageRating.toFixed(1)}
                        </div>
                        <StarRating rating={ratingData.averageRating} size="sm" readonly />
                        <div className="text-sm text-slate-400 mt-1">
                          {ratingData.totalRatings} avis
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        {[5, 4, 3, 2, 1].map(star => (
                          <div key={star} className="flex items-center gap-2 text-sm">
                            <span className="text-slate-300 w-2">{star}</span>
                            <div className="flex-1 bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{
                                  width: ratingData.totalRatings > 0
                                    ? `${(ratingData.ratingCounts[star as keyof typeof ratingData.ratingCounts] / ratingData.totalRatings) * 100}%`
                                    : '0%'
                                }}
                              />
                            </div>
                            <span className="text-slate-400 w-8 text-right">
                              {ratingData.ratingCounts[star as keyof typeof ratingData.ratingCounts]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rating Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Votre note
                    </label>
                    <StarRating
                      rating={userRating}
                      onRatingChange={setUserRating}
                      size="lg"
                      readonly={!currentUser}
                      showValue={false}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Commentaire (optionnel)
                    </label>
                    <textarea
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Partagez votre expérience avec cette stack..."
                      disabled={!currentUser}
                      className="w-full h-24 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleSubmitRating}
                      disabled={!currentUser || submitting || userRating === 0}
                      className="flex-1"
                    >
                      {submitting ? 'Envoi...' : 'Publier l\'avis'}
                    </Button>
                    
                    {currentUser && ratingData?.ratings.some(r => r.user_id === currentUser.id) && (
                      <Button
                        variant="secondary"
                        onClick={handleDeleteRating}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {!currentUser && (
                    <p className="text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                      Connectez-vous pour noter cette stack
                    </p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8 text-slate-400">
                    Chargement des avis...
                  </div>
                ) : ratingData?.ratings.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    Aucun avis pour le moment
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ratingData?.ratings.map((review) => (
                      <div key={review.id} className="border-b border-slate-700 pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-slate-400" />
                            </div>
                            <div>
                              <div className="font-medium text-white text-sm">
                                {getUserDisplayName(review.users)}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Calendar className="h-3 w-3" />
                                {formatDate(review.created_at)}
                              </div>
                            </div>
                          </div>
                          <StarRating rating={review.rating} size="sm" readonly showValue={false} />
                        </div>
                        
                        {review.comment && (
                          <div className="ml-11 mt-2">
                            <div className="bg-slate-800/30 rounded-lg p-3">
                              <MessageSquare className="h-4 w-4 text-slate-500 mb-2" />
                              <p className="text-slate-300 text-sm leading-relaxed">
                                {review.comment}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};