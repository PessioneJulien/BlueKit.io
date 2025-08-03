'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { 
  User,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  MessageCircle,
  CheckCircle,
  Star
} from 'lucide-react';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  notHelpfulCount: number;
  isVerified: boolean;
  createdAt: Date;
  criteria: {
    documentation: number;
    easeOfUse: number;
    performance: number;
    support: number;
  };
}

interface ComponentReviewProps {
  componentId: string;
  componentName: string;
  currentUserId?: string;
  onReviewSubmit?: (review: Partial<Review>) => void;
}

export const ComponentReview: React.FC<ComponentReviewProps> = ({
  currentUserId,
  onReviewSubmit
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [overallRating, setOverallRating] = useState(0);
  const [criteria, setCriteria] = useState({
    documentation: 0,
    easeOfUse: 0,
    performance: 0,
    support: 0
  });
  const [comment, setComment] = useState('');
  const [userVotes, setUserVotes] = useState<Record<string, 'helpful' | 'not-helpful'>>({});

  // Mock reviews data
  const [reviews] = useState<Review[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'John Developer',
      rating: 4.5,
      comment: 'Excellent component! Very easy to integrate and well documented. The setup was straightforward and the performance is great.',
      helpfulCount: 12,
      notHelpfulCount: 2,
      isVerified: true,
      createdAt: new Date('2024-01-10'),
      criteria: {
        documentation: 5,
        easeOfUse: 4,
        performance: 5,
        support: 4
      }
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Sarah Coder',
      rating: 3.5,
      comment: 'Good component but documentation could be better. Had some issues with TypeScript types.',
      helpfulCount: 8,
      notHelpfulCount: 3,
      isVerified: false,
      createdAt: new Date('2024-01-05'),
      criteria: {
        documentation: 3,
        easeOfUse: 4,
        performance: 4,
        support: 3
      }
    }
  ]);

  const handleSubmitReview = () => {
    if (!overallRating || !comment.trim()) {
      alert('Please provide a rating and comment');
      return;
    }

    const newReview: Partial<Review> = {
      rating: overallRating,
      comment,
      criteria,
      userId: currentUserId,
      userName: 'Current User', // In real app, get from user data
      isVerified: false,
      helpfulCount: 0,
      notHelpfulCount: 0,
      createdAt: new Date()
    };

    if (onReviewSubmit) {
      onReviewSubmit(newReview);
    }

    // Reset form
    setOverallRating(0);
    setCriteria({ documentation: 0, easeOfUse: 0, performance: 0, support: 0 });
    setComment('');
    setShowReviewForm(false);
  };

  const handleVote = (reviewId: string, type: 'helpful' | 'not-helpful') => {
    setUserVotes(prev => ({
      ...prev,
      [reviewId]: type
    }));
  };

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0;
  const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
    const rating = 5 - i;
    const count = reviews.filter(r => Math.floor(r.rating) === rating).length;
    const percentage = (count / reviews.length) * 100 || 0;
    return { rating, count, percentage };
  });

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Component Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">
                {averageRating.toFixed(1)}
              </div>
              <StarRating rating={averageRating} readonly size="lg" showValue={false} />
              <p className="text-sm text-slate-400 mt-2">
                Based on {reviews.length} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 w-4">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-400 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Button */}
          {currentUserId && !showReviewForm && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <Button
                variant="primary"
                onClick={() => setShowReviewForm(true)}
                className="w-full"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Write a Review
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Write Your Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Overall Rating
              </label>
              <StarRating
                rating={overallRating}
                onRatingChange={setOverallRating}
                size="lg"
              />
            </div>

            {/* Criteria Ratings */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Rate specific aspects
              </label>
              
              {Object.entries({
                documentation: 'Documentation',
                easeOfUse: 'Ease of Use',
                performance: 'Performance',
                support: 'Support'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">{label}</span>
                  <StarRating
                    rating={criteria[key as keyof typeof criteria]}
                    onRatingChange={(rating) => 
                      setCriteria(prev => ({ ...prev, [key]: rating }))
                    }
                    size="sm"
                    showValue={false}
                  />
                </div>
              ))}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this component..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="primary" onClick={handleSubmitReview}>
                Submit Review
              </Button>
              <Button variant="secondary" onClick={() => setShowReviewForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} variant="glass">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{review.userName}</span>
                      {review.isVerified && (
                        <Badge variant="success" size="sm">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <StarRating rating={review.rating} readonly size="sm" />
              </div>

              <p className="text-slate-300 mb-4">{review.comment}</p>

              {/* Criteria Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {Object.entries(review.criteria).map(([key, value]) => (
                  <div key={key} className="text-center p-2 bg-slate-800/50 rounded">
                    <div className="text-xs text-slate-400 capitalize mb-1">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="flex items-center justify-center">
                      <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                      <span className="text-sm text-white">{value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Helpful */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-400">Was this helpful?</span>
                <button
                  onClick={() => handleVote(review.id, 'helpful')}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1 rounded transition-colors',
                    userVotes[review.id] === 'helpful'
                      ? 'bg-green-500/20 text-green-400'
                      : 'text-slate-400 hover:text-green-400'
                  )}
                >
                  <ThumbsUp className="w-4 h-4" />
                  {review.helpfulCount}
                </button>
                <button
                  onClick={() => handleVote(review.id, 'not-helpful')}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1 rounded transition-colors',
                    userVotes[review.id] === 'not-helpful'
                      ? 'bg-red-500/20 text-red-400'
                      : 'text-slate-400 hover:text-red-400'
                  )}
                >
                  <ThumbsDown className="w-4 h-4" />
                  {review.notHelpfulCount}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}