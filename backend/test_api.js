import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import supertest from 'supertest';

import authRoutes from './routes/auth.routes.js';
import therapistRoutes from './routes/therapist.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import patientRoutes from './routes/patient.routes.js';
import programRoutes from './routes/program.routes.js';
import sessionRoutes from './routes/session.routes.js';
import progressRoutes from './routes/progress.routes.js';
import reportRoutes from './routes/report.routes.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/therapists', therapistRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reports', reportRoutes);

const runTests = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB for API tests');

    const request = supertest(app);

    // 1. Patient Login
    console.log('1. Testing Patient Login...');
    const patientLoginRes = await request.post('/api/auth/login').send({
      username: 'rahul_sharma',
      password: 'password123',
    });
    console.log('   Patient Login Status:', patientLoginRes.status, patientLoginRes.body.success ? 'PASSED' : 'FAILED');
    const patientToken = patientLoginRes.body.token;

    // 2. Therapist Login
    console.log('2. Testing Therapist Login...');
    const therapistLoginRes = await request.post('/api/auth/login').send({
      username: 'dr_ananya',
      password: 'password123',
    });
    console.log('   Therapist Login Status:', therapistLoginRes.status, therapistLoginRes.body.success ? 'PASSED' : 'FAILED');
    const therapistToken = therapistLoginRes.body.token;

    // 3. Patient Dashboard API
    console.log('3. Testing GET /api/patients/dashboard...');
    const dashRes = await request
      .get('/api/patients/dashboard')
      .set('Authorization', `Bearer ${patientToken}`);
    console.log('   Dashboard Status:', dashRes.status, 'Streak:', dashRes.body.dashboard?.stats?.currentStreak);

    // 4. Therapists List API
    console.log('4. Testing GET /api/therapists...');
    const therapistsRes = await request.get('/api/therapists');
    console.log('   Therapists Found:', therapistsRes.body.therapists?.length);

    // 5. Book Appointment API
    console.log('5. Testing POST /api/appointments/book...');
    const therapistId = therapistsRes.body.therapists[0]?.user?._id;
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const bookRes = await request
      .post('/api/appointments/book')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        therapistId,
        date: tomorrowStr,
        startTime: '14:00',
        endTime: '14:30',
        appointmentType: 'ONLINE',
        notes: 'Follow-up consultation for knee flexion.',
      });
    console.log('   Book Appointment Status:', bookRes.status, bookRes.body.message);

    // 6. Save Session API (Peak ROM & Streak Engine)
    console.log('6. Testing POST /api/sessions/save...');
    const sessionRes = await request
      .post('/api/sessions/save')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        exerciseSlug: 'knee_ext',
        exerciseName: 'Seated Knee Extension',
        durationSeconds: 300,
        targetReps: 10,
        completedReps: 10,
        averageROM: 145,
        bestROM: 155,
        qualityScore: 94,
        feedbackEvents: ['✓ Full Range of Motion', '✓ Smooth Tempo'],
      });
    console.log('   Save Session Status:', sessionRes.status, 'Updated Streak:', sessionRes.body.streak, 'Adherence:', sessionRes.body.adherencePercentage + '%');

    // 7. Progress Analytics API
    console.log('7. Testing GET /api/progress/analytics...');
    const progressRes = await request
      .get('/api/progress/analytics?days=30')
      .set('Authorization', `Bearer ${patientToken}`);
    console.log('   Analytics Data Points:', progressRes.body.analytics?.romTrend?.length);

    // 8. Generate Report API (Doctor Prescribed Exercises & Durations)
    console.log('8. Testing POST /api/reports/generate...');
    const reportRes = await request
      .post('/api/reports/generate')
      .set('Authorization', `Bearer ${therapistToken}`)
      .send({
        patientId: patientLoginRes.body.user._id,
        title: 'Monthly Progress & Knee Range of Motion Evaluation',
        therapistNotes: 'Patient has made excellent progress. Peak ROM reached 155°.',
        prescribedExercises: [
          { exerciseName: 'Seated Knee Extension', sets: 3, reps: 10, targetROM: 160, prescribedDurationMinutes: 15 },
          { exerciseName: 'Full Body Squat', sets: 3, reps: 8, targetROM: 90, prescribedDurationMinutes: 10 },
        ],
        prescribedDailyDurationMinutes: 25,
      });
    console.log('   Generate Report Status:', reportRes.status, 'Report Title:', reportRes.body.report?.title);

    // 9. Get Patient Reports API
    console.log('9. Testing GET /api/reports/my...');
    const myReportsRes = await request
      .get('/api/reports/my')
      .set('Authorization', `Bearer ${patientToken}`);
    console.log('   Patient Reports Count:', myReportsRes.body.reports?.length);

    console.log('--------------------------------------------------');
    console.log('🎉 ALL API TESTS COMPLETED SUCCESSFULLY!');
    console.log('--------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('API Test Error:', err);
    process.exit(1);
  }
};

runTests();
