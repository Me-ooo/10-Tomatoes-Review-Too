import express from 'express';
import { getReviewsForMovie, createReview } from '../controllers/review.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/movies/:id/reviews', getReviewsForMovie);
router.post('/reviews', protect, createReview);

export default router;
