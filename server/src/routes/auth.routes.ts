/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: User registered
 */
import express from 'express';
import { register, login, updateProfile, changePassword } from '../controllers/auth.controller.js';
import { protect } from '../middleware/protect.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;
