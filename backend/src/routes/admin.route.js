import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { admin } from '../middleware/admin.js';
import {
  getAllMovies,
  createMovie,
  updateMovie,
  deleteMovie,
  getAllReviews,
  deleteReview,
  getAllUsers,
} from '../controllers/admin.controller.js';

const router = express.Router();

// All routes require user to be logged in and have admin role
router.use(protect, admin);

// Movie Management
router.get('/movies', getAllMovies);
router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);

// Review Moderation
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

// User Overview
router.get('/users', getAllUsers);

export default router;
