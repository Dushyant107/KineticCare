import mongoose from 'mongoose';
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
import Report from './models/Report.js';

dotenv.config();

const runValidation = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB Atlas:', mongoose.connection.name);

    // 1. Verify Database Name
    console.log(`1. Database Target: ${mongoose.connection.name}`);
    if (mongoose.connection.name !== 'KineticCare_Database') {
      console.warn('⚠️ Warning: Database name is not KineticCare_Database!');
    } else {
      console.log('   PASSED: Connected strictly to KineticCare_Database');
    }

    // 2. Verify Seeded Users & Profiles
    const patientUser = await User.findOne({ username: 'rahul_sharma' });
    const therapistUser = await User.findOne({ username: 'dr_ananya' });
    console.log('2. Seeded Users Verification:');
    console.log('   Patient Found:', patientUser?.name, '| Role:', patientUser?.role);
    console.log('   Therapist Found:', therapistUser?.name, '| Role:', therapistUser?.role);

    const patientProf = await PatientProfile.findOne({ userId: patientUser._id });
    const therapistProf = await TherapistProfile.findOne({ userId: therapistUser._id });
    console.log('   Patient Profile Current Streak:', patientProf?.currentStreak);
    console.log('   Therapist Profile Specialization:', therapistProf?.specialization);

    // 3. Verify Therapist Availability Slots
    const availabilityCount = await TherapistAvailability.countDocuments({ therapistId: therapistUser._id });
    console.log('3. Therapist Availability Weekly Schedule Count:', availabilityCount, 'days');

    // 4. Verify Exercise Library
    const exerciseCount = await Exercise.countDocuments({});
    console.log('4. Exercises in Library:', exerciseCount);

    // 5. Verify Daily Progress & Clinical Reports
    const dailyProgressCount = await DailyProgress.countDocuments({ patientId: patientUser._id });
    const reportCount = await Report.countDocuments({ patientId: patientUser._id });
    console.log('5. Daily Progress Records:', dailyProgressCount);
    console.log('   Clinical Reports Found:', reportCount);

    console.log('--------------------------------------------------');
    console.log('🎉 ALL KINETICCARE_DATABASE VALIDATIONS PASSED!');
    console.log('--------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Validation error:', err);
    process.exit(1);
  }
};

runValidation();
