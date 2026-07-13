import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { submitTestimonial, fetchCourseTestimonials, TestimonialDto } from '../academy/api';
import { useAuth } from '../auth/AuthContext';

interface CourseRatingModalProps {
  courseId: string;
  courseTitle: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function CourseRatingModal({ courseId, courseTitle, onClose, onSubmitted }: CourseRatingModalProps) {
  const { profile } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkExisting() {
      if (!profile) return;
      try {
        const res = await fetchCourseTestimonials(courseId);
        const reviewed = res.testimonials.some(t => t.userId === profile.userId);
        setHasReviewed(reviewed);
        if (reviewed) {
          onSubmitted();
        }
      } catch (e) {
        console.error(e);
      } finally {
        setChecking(false);
      }
    }
    checkExisting();
  }, [courseId, profile, onSubmitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || rating < 1) return;
    
    setLoading(true);
    try {
      await submitTestimonial(courseId, { content, rating });
      onSubmitted();
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (checking || hasReviewed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-8 shadow-2xl">
        <button onClick={onClose} aria-label="Close" className="absolute right-6 top-6 text-slate-400 hover:text-white">
          <X className="h-6 w-6" />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Congratulations! 🎉</h2>
          <p className="text-slate-400 mb-8">You've completed <strong>{courseTitle}</strong>. How would you rate your experience?</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate ${star} stars`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star 
                    className={`h-12 w-12 ${star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-800 text-slate-700'}`} 
                  />
                </button>
              ))}
            </div>

            <textarea
              required
              rows={4}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write a brief review about what you learned..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-800 p-4 text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />

            <button
              disabled={loading || !content.trim()}
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-4 font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
          <button onClick={onClose} className="mt-4 text-sm text-slate-500 hover:text-slate-300">
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
