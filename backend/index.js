import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import therapistRoutes from './routes/therapist.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import patientRoutes from './routes/patient.routes.js';
import programRoutes from './routes/program.routes.js';
import sessionRoutes from './routes/session.routes.js';
import progressRoutes from './routes/progress.routes.js';
import messageRoutes from './routes/message.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import reportRoutes from './routes/report.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/KineticCare_Database';

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('✅ Connected to MongoDB KineticCare Database');
  })
  .catch((err) => {
    console.warn('⚠️ MongoDB connection warning:', err.message);
  });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Legacy route aliases for backwards compatibility
app.use('/register', authRoutes);
app.use('/login', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'KineticCare AI Rehabilitation Platform API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 KineticCare API server running on port ${PORT}`);
});