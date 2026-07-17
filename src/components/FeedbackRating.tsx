import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Check, Send } from 'lucide-react';

interface FeedbackRatingProps {
  documentId: string;
  onSubmitted: () => void;
}

export const FeedbackRating: React.FC<FeedbackRatingProps> = ({ documentId, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) return;
    // In a real app, save to Firestore
    setIsSubmitted(true);
    setTimeout(() => {
      onSubmitted();
    }, 2000);
  };

  return (
    <div className="bg-white border border-vanilla-main rounded-2xl p-6 shadow-sm">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="text-center">
              <h3 className="text-sm font-bold text-brand-secondary">How was your experience?</h3>
              <p className="text-[10px] text-text-light mt-1">Was this document helpful for your needs?</p>
            </div>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star 
                    className={`h-6 w-6 transition-colors ${
                      (hoveredRating || rating) >= star 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-gray-200'
                    }`} 
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Anything we could improve?"
                  className="w-full text-xs p-3 bg-neutral-50 border border-vanilla-main rounded-xl focus:outline-hidden focus:border-brand-primary transition-colors resize-none"
                  rows={2}
                />
                <button
                  onClick={handleSubmit}
                  className="w-full py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" />
                  Submit Feedback
                </button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4"
          >
            <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-brand-secondary">Thank you!</h3>
            <p className="text-[10px] text-text-light">Your feedback helps us improve AI Assistant.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
