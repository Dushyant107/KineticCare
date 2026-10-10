import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

import User from './models/User.js';
import PatientProfile from './models/PatientProfile.js';
import TherapistProfile from './models/TherapistProfile.js';
import TherapistAvailability from './models/TherapistAvailability.js';
import Exercise from './models/Exercise.js';
import RehabilitationProgram from './models/RehabilitationProgram.js';
import ExerciseSession from './models/ExerciseSession.js';
import DailyProgress from './models/DailyProgress.js';
import Appointment from './models/Appointment.js';
import Notification from './models/Notification.js';
import Report from './models/Report.js';

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/KineticCare_Database';

const seedData = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await PatientProfile.deleteMany({});
    await TherapistProfile.deleteMany({});
    await TherapistAvailability.deleteMany({});
    await Exercise.deleteMany({});
    await RehabilitationProgram.deleteMany({});
    await ExerciseSession.deleteMany({});
    await DailyProgress.deleteMany({});
    await Appointment.deleteMany({});
    await Notification.deleteMany({});
    await Report.deleteMany({});

    console.log('Cleared old database records.');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Seed Therapist User: Dr. Ananya Sharma & Dr. Marcus Vance
    const therapistUser = await User.create({
      username: 'dr_ananya',
      email: 'ananya.sharma@kineticcare.com',
      password: passwordHash,
      role: 'THERAPIST',
      name: 'Dr. Ananya Sharma',
      avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce7896c?w=150&auto=format&fit=crop&q=80',
      onboardingCompleted: true,
    });

    await TherapistProfile.create({
      userId: therapistUser._id,
      specialization: 'Sports Physiotherapy & Knee Rehabilitation',
      experienceYears: 8,
      qualifications: ['M.PT - Master of Physiotherapy', 'Certified Orthopedic Specialist (OCS)'],
      languages: ['English', 'Hindi'],
      consultationModes: ['ONLINE', 'IN_PERSON'],
      clinic: 'KineticCare Advanced Sports Rehab Center',
      bio: 'Specializing in post-operative knee recovery, ligament rehab, and AI-tracked range-of-motion therapy with over 8 years of clinical experience.',
      rating: 4.9,
      totalPatients: 24,
    });

    const therapist2 = await User.create({
      username: 'dr_marcus',
      email: 'marcus.vance@kineticcare.com',
      password: passwordHash,
      role: 'THERAPIST',
      name: 'Dr. Marcus Vance',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      onboardingCompleted: true,
    });

    await TherapistProfile.create({
      userId: therapist2._id,
      specialization: 'Shoulder & Spine Musculoskeletal Rehabilitation',
      experienceYears: 11,
      qualifications: ['DPT - Doctor of Physical Therapy', 'Board Certified Sports Specialist'],
      languages: ['English', 'Spanish'],
      consultationModes: ['ONLINE', 'IN_PERSON'],
      clinic: 'Vance Performance & Orthopedic Spine Clinic',
      bio: 'Expert in shoulder biomechanics, spinal mobility, rotator cuff rehabilitation, and quantitative motion tracking.',
      rating: 4.85,
      totalPatients: 38,
    });

    // Seed Availability for both therapists
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (const therapistId of [therapistUser._id, therapist2._id]) {
      for (const day of days) {
        await TherapistAvailability.create({
          therapistId,
          dayOfWeek: day,
          enabled: true,
          intervals: [
            { startTime: '09:00', endTime: '13:00' },
            { startTime: '14:00', endTime: '17:00' },
          ],
          slotDurationMinutes: 30,
          bufferMinutes: 10,
        });
      }
    }

    // 2. Seed Patient User: Rahul Sharma
    const patientUser = await User.create({
      username: 'rahul_sharma',
      email: 'rahul.sharma@gmail.com',
      password: passwordHash,
      role: 'PATIENT',
      name: 'Rahul Sharma',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      onboardingCompleted: true,
    });

    await PatientProfile.create({
      userId: patientUser._id,
      age: 29,
      gender: 'Male',
      rehabilitationGoal: 'ACL Surgery Recovery & Knee Range of Motion',
      affectedAreas: ['Left Knee'],
      conditionDescription: 'Post ACL reconstruction (6 weeks recovery phase)',
      activityLevel: 'Moderate',
      exerciseFrequency: 'Daily',
      therapistId: therapistUser._id,
      currentStreak: 7,
      longestStreak: 12,
      lastActiveDate: new Date(),
      activeDaysCount: 18,
      recoveryScore: 84,
    });

    // 3. Seed Comprehensive Exercises
    const exercisesList = [
      {
        name: 'Seated Knee Extension',
        slug: 'knee_ext',
        description: 'Sit upright in a chair and extend your lower leg forward until fully horizontal, maintaining quad tension.',
        bodyPart: 'Knee',
        difficulty: 'Easy',
        instructions: [
          'Sit upright in a sturdy chair with back supported.',
          'Slowly straighten your leg out in front of you.',
          'Hold at peak extension for 2 seconds.',
          'Slowly lower back to starting position.',
        ],
        targetMuscles: ['Quadriceps', 'Patellar Tendon'],
        targetROM: 160,
      },
      {
        name: 'Left Arm Bicep Curl',
        slug: 'left_curl',
        description: 'Controlled bicep curl locking upper arm near ribs for elbow mobility.',
        bodyPart: 'Arm',
        difficulty: 'Easy',
        instructions: ['Lock elbow to side.', 'Raise hand to shoulder.', 'Lower smoothly.'],
        targetMuscles: ['Biceps Brachii'],
        targetROM: 140,
      },
      {
        name: 'Right Arm Bicep Curl',
        slug: 'right_curl',
        description: 'Controlled right arm bicep curl.',
        bodyPart: 'Arm',
        difficulty: 'Easy',
        instructions: ['Lock right elbow.', 'Flex bicep to shoulder height.'],
        targetMuscles: ['Biceps Brachii'],
        targetROM: 140,
      },
      {
        name: 'Full Body Squat',
        slug: 'squat',
        description: 'Lower hips with back straight to strengthen knee stabilization.',
        bodyPart: 'Full Body',
        difficulty: 'Medium',
        instructions: ['Feet shoulder-width apart.', 'Push hips back.', 'Lower to 90 degrees knee bend.'],
        targetMuscles: ['Quadriceps', 'Gluteus Maximus', 'Hamstrings'],
        targetROM: 90,
      },
      {
        name: 'Lateral Shoulder Raise',
        slug: 'shoulder_lat',
        description: 'Raise straight arm sideways to parallel position.',
        bodyPart: 'Shoulder',
        difficulty: 'Medium',
        instructions: ['Stand tall.', 'Raise arms to T-shape.', 'Control descent.'],
        targetMuscles: ['Deltoids'],
        targetROM: 90,
      },
      {
        name: 'Front Shoulder Raise',
        slug: 'shoulder_front',
        description: 'Raise arm directly in front until parallel to the floor.',
        bodyPart: 'Shoulder',
        difficulty: 'Easy',
        instructions: ['Stand upright.', 'Raise arm forward.', 'Pause at top and lower slowly.'],
        targetMuscles: ['Anterior Deltoid', 'Pectoralis Major'],
        targetROM: 90,
      },
      {
        name: 'Standing Wall Slide',
        slug: 'wall_slides',
        description: 'Slide forearms vertically against a smooth wall to enhance scapular and shoulder mobility.',
        bodyPart: 'Spine & Shoulder',
        difficulty: 'Easy',
        instructions: ['Stand facing wall.', 'Place forearms flat against wall.', 'Slide arms upward smoothly.'],
        targetMuscles: ['Trapezius', 'Serratus Anterior'],
        targetROM: 150,
      },
      {
        name: 'Side Hip Abduction',
        slug: 'hip_abduction',
        description: 'Raise leg sideways while standing straight to stabilize hip adductors and gluteus medius.',
        bodyPart: 'Hip',
        difficulty: 'Medium',
        instructions: ['Hold onto support.', 'Lift leg out sideways to 45 degrees.', 'Return slowly.'],
        targetMuscles: ['Gluteus Medius', 'Tensor Fasciae Latae'],
        targetROM: 45,
      },
    ];

    const seededExercises = await Exercise.insertMany(exercisesList);

    // 4. Seed Rehabilitation Program
    const program = await RehabilitationProgram.create({
      patientId: patientUser._id,
      therapistId: therapistUser._id,
      name: 'Knee Recovery — Phase 2',
      description: 'Progressive flexion & quad strengthening program following knee ligament rehabilitation.',
      goal: 'Improve Knee Flexion ROM to 160° and restore quad stability',
      status: 'ACTIVE',
      exercises: [
        {
          exerciseId: seededExercises[0]._id,
          exerciseSlug: 'knee_ext',
          exerciseName: 'Seated Knee Extension',
          sets: 3,
          reps: 10,
          durationSeconds: 300,
          targetROM: 160,
          frequency: 'Daily',
          instructions: 'Perform slowly. Ensure complete extension on every rep.',
        },
        {
          exerciseId: seededExercises[3]._id,
          exerciseSlug: 'squat',
          exerciseName: 'Full Body Squat',
          sets: 3,
          reps: 8,
          durationSeconds: 240,
          targetROM: 90,
          frequency: '3 times per week',
          instructions: 'Keep back neutral and knees aligned over toes.',
        },
      ],
    });

    // 5. Seed Past Sessions & Daily Progress over last 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const quality = 88 + Math.floor(Math.random() * 8);
      const rom = 120 + i * 4;

      await ExerciseSession.create({
        patientId: patientUser._id,
        exerciseId: seededExercises[0]._id,
        exerciseSlug: 'knee_ext',
        exerciseName: 'Seated Knee Extension',
        programId: program._id,
        durationSeconds: 420,
        targetReps: 10,
        completedReps: 10,
        averageROM: rom,
        bestROM: rom + 8,
        qualityScore: quality,
        feedbackEvents: ['✓ Excellent extension', '✓ Consistent tempo'],
        completedAt: date,
      });

      await DailyProgress.create({
        patientId: patientUser._id,
        date: dateStr,
        sessionsCompleted: 1,
        exercisesCompleted: 2,
        totalReps: 18,
        totalDurationSeconds: 540,
        averageQuality: quality,
        averageROM: rom,
        bestROM: rom + 8,
        adherencePercentage: 100,
        activeDay: true,
      });
    }

    // 6. Seed Appointment
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    await Appointment.create({
      patientId: patientUser._id,
      therapistId: therapistUser._id,
      date: tomorrowStr,
      startTime: '10:30',
      endTime: '11:00',
      appointmentType: 'ONLINE',
      status: 'CONFIRMED',
      notes: '6-Week Knee Range of Motion Progress Review & Program Adjustment.',
    });

    // 7. Seed Doctor Clinical Report
    await Report.create({
      patientId: patientUser._id,
      therapistId: therapistUser._id,
      title: 'Clinical Evaluation & Rehabilitation Plan — Month 1',
      dateRange: 'First 30 Days Post-Op',
      sessionsCompleted: 18,
      adherenceRate: 100,
      averageQuality: 92,
      averageROM: 144,
      recoveryScore: 84,
      aiObservations: [
        'Knee extension improved from 120° to 144° over the last 14 days.',
        'Zero movement hesitation detected during terminal extension phase.',
        'Quadriceps muscle activation symmetry has improved to 94%.',
      ],
      therapistNotes: 'Patient Rahul Sharma shows remarkable commitment. Continue current daily knee extensions for 15 mins/day and gradual full-body squats.',
    });

    // 8. Seed Notifications
    await Notification.create({
      userId: patientUser._id,
      type: 'STREAK_MILESTONE',
      title: '🔥 7-Day Rehabilitation Streak!',
      message: 'Congratulations Rahul! You completed 7 consecutive days of knee rehabilitation exercises.',
    });

    await Notification.create({
      userId: patientUser._id,
      type: 'APPOINTMENT_REMINDER',
      title: 'Upcoming Consultation Tomorrow',
      message: 'Your online consultation with Dr. Ananya Sharma is scheduled for tomorrow at 10:30 AM.',
    });

    console.log('Successfully seeded database with demo data!');
    console.log('--------------------------------------------------');
    console.log('Patient Login:   username: rahul_sharma | password: password123');
    console.log('Therapist Login: username: dr_ananya    | password: password123');
    console.log('--------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

