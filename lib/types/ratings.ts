export interface StackRating {
  id: string;
  stack_id: string;
  user_id: string;
  rating: number; // 1 to 5
  comment?: string;
  created_at: string;
  updated_at?: string;
}

export interface StackRatingWithUser extends StackRating {
  users: {
    id: string;
    email: string;
    user_metadata: {
      full_name?: string;
      name?: string;
      avatar_url?: string;
    };
  };
}

export interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingCounts: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  ratings: StackRatingWithUser[];
}

export interface RatingSubmission {
  rating: number;
  comment?: string;
}