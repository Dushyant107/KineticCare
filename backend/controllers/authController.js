import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import TherapistProfile from '../models/TherapistProfile.js';
import TherapistAvailability from '../models/TherapistAvailability.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'kineticcare_jwt_secret_key_2026';

export const register = async (req, res) => {
  try {
    const { username, email, password, role = 'PATIENT', name } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const displayName = name || username;

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role.toUpperCase(),
      name: displayName,
    });

    if (newUser.role === 'PATIENT') {
      await PatientProfile.create({ userId: newUser._id });
    } else if (newUser.role === 'THERAPIST') {
      await TherapistProfile.create({
        userId: newUser._id,
        specialization: 'Physiotherapist & Movement Specialist',
        qualifications: ['B.PT - Bachelor of Physiotherapy', 'Certified Clinical Ergonomist'],
        languages: ['English', 'Hindi'],
        consultationModes: ['ONLINE', 'IN_PERSON'],
        clinic: 'KineticCare Digital Health Clinic',
        rating: 4.8,
        totalPatients: 0,
      });

      // Auto-generate default working availability slots (Mon - Fri)
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      for (const day of days) {
        await TherapistAvailability.create({
          therapistId: newUser._id,
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

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, getJwtSecret(), { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        onboardingCompleted: newUser.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username/email and password' });
    }

    const user = await User.findOne({
      $or: [{ username }, { email: username.toLowerCase() }],
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, getJwtSecret(), { expiresIn: '7d' });

    let profile = null;
    if (user.role === 'PATIENT') {
      profile = await PatientProfile.findOne({ userId: user._id }).populate('therapistId', 'name email avatar');
    } else if (user.role === 'THERAPIST') {
      profile = await TherapistProfile.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        onboardingCompleted: user.onboardingCompleted,
        profile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

export const getMe = async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'PATIENT') {
      profile = await PatientProfile.findOne({ userId: req.user._id }).populate('therapistId', 'name email avatar');
    } else if (req.user.role === 'THERAPIST') {
      profile = await TherapistProfile.findOne({ userId: req.user._id });
    }

    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        avatar: req.user.avatar,
        onboardingCompleted: req.user.onboardingCompleted,
        profile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user profile' });
  }
};
