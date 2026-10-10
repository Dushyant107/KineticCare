import User from '../models/User.js';
import TherapistProfile from '../models/TherapistProfile.js';
import TherapistAvailability from '../models/TherapistAvailability.js';
import AvailabilityException from '../models/AvailabilityException.js';

export const getAllTherapists = async (req, res) => {
  try {
    const { search, specialization, mode, language } = req.query;

    const query = { role: 'THERAPIST' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const therapistUsers = await User.find(query).select('-password');
    const userIds = therapistUsers.map(u => u._id);

    const profileQuery = { userId: { $in: userIds } };
    if (specialization) {
      profileQuery.specialization = { $regex: specialization, $options: 'i' };
    }
    if (mode) {
      profileQuery.consultationModes = mode;
    }
    if (language) {
      profileQuery.languages = language;
    }

    const profiles = await TherapistProfile.find(profileQuery);
    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]));

    const therapists = therapistUsers
      .filter(u => profileMap.has(u._id.toString()))
      .map(u => ({
        user: u,
        profile: profileMap.get(u._id.toString()),
      }));

    res.json({ success: true, count: therapists.length, therapists });
  } catch (error) {
    console.error('getAllTherapists error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch therapists' });
  }
};

export const getTherapistById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || user.role !== 'THERAPIST') {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    const profile = await TherapistProfile.findOne({ userId: user._id });
    const availability = await TherapistAvailability.find({ therapistId: user._id });

    res.json({
      success: true,
      therapist: {
        user,
        profile,
        availability,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching therapist details' });
  }
};

export const getTherapistAvailability = async (req, res) => {
  try {
    const therapistId = req.params.id || req.user._id;
    const availability = await TherapistAvailability.find({ therapistId });
    const exceptions = await AvailabilityException.find({ therapistId });

    res.json({ success: true, availability, exceptions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch therapist availability' });
  }
};

export const updateTherapistAvailability = async (req, res) => {
  try {
    const therapistId = req.user._id;
    const { weeklySchedule, slotDurationMinutes = 30, bufferMinutes = 10 } = req.body;

    if (!Array.isArray(weeklySchedule)) {
      return res.status(400).json({ success: false, message: 'weeklySchedule must be an array' });
    }

    for (const item of weeklySchedule) {
      const { dayOfWeek, enabled = true, intervals = [] } = item;

      await TherapistAvailability.findOneAndUpdate(
        { therapistId, dayOfWeek },
        {
          therapistId,
          dayOfWeek,
          enabled,
          intervals,
          slotDurationMinutes,
          bufferMinutes,
        },
        { upsert: true, new: true }
      );
    }

    const updated = await TherapistAvailability.find({ therapistId });
    res.json({ success: true, message: 'Availability updated successfully', availability: updated });
  } catch (error) {
    console.error('updateTherapistAvailability error:', error);
    res.status(500).json({ success: false, message: 'Failed to update availability' });
  }
};
