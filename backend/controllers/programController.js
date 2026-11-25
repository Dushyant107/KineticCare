import RehabilitationProgram from '../models/RehabilitationProgram.js';
import Notification from '../models/Notification.js';
import {
  EXERCISE_CATALOG,
  isDateKey,
  serverDateKey,
  loadSessions,
  buildRecommendations,
} from '../services/stats.js';

export const createProgram = async (req, res) => {
  try {
    const therapistId = req.user._id;
    const { patientId, name, description, goal, exercises, status = 'ACTIVE' } = req.body;

    if (!patientId || !name || !exercises || exercises.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide patient ID, program name, and at least one exercise' });
    }

    // Deactivate previous active programs for this patient
    if (status === 'ACTIVE') {
      await RehabilitationProgram.updateMany(
        { patientId, status: 'ACTIVE' },
        { status: 'COMPLETED' }
      );
    }

    const program = await RehabilitationProgram.create({
      patientId,
      therapistId,
      name,
      description,
      goal,
      exercises,
      status,
    });

    await Notification.create({
      userId: patientId,
      type: 'PROGRAM_UPDATED',
      title: 'New Rehabilitation Program Assigned',
      message: `Your therapist assigned a new program: "${name}". Check your plan to start exercises.`,
    });

    res.status(201).json({
      success: true,
      message: 'Rehabilitation program created successfully',
      program,
    });
  } catch (error) {
    console.error('createProgram error:', error);
    res.status(500).json({ success: false, message: 'Failed to create rehabilitation program' });
  }
};

export const getMyProgram = async (req, res) => {
  try {
    const patientId = req.user._id;
    const program = await RehabilitationProgram.findOne({ patientId, status: 'ACTIVE' })
      .populate('therapistId', 'name email avatar');

    res.json({ success: true, program });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch program' });
  }
};

// "My Program": exercises the patient has already done, recommended again
// with a progression target, plus any therapist-assigned program.
export const getRecommendedProgram = async (req, res) => {
  try {
    const patientId = req.user._id;
    const today = isDateKey(req.query.today) ? req.query.today : serverDateKey();

    const [sessions, assignedProgram] = await Promise.all([
      loadSessions(patientId),
      RehabilitationProgram.findOne({ patientId, status: 'ACTIVE' }).populate('therapistId', 'name email avatar'),
    ]);

    const recommendations = buildRecommendations(sessions, today);
    const doneSlugs = new Set(recommendations.map((r) => r.exerciseSlug));

    // Exercises the tracker supports that the patient hasn't tried yet.
    const notTried = Object.entries(EXERCISE_CATALOG)
      .filter(([slug]) => !doneSlugs.has(slug))
      .map(([slug, ex]) => ({
        exerciseSlug: slug,
        exerciseName: ex.name,
        bodyPart: ex.bodyPart,
        targetROM: ex.targetROM,
        recommendedReps: ex.defaultReps,
      }));

    res.json({
      success: true,
      today,
      recommendations,
      notTried,
      completedToday: recommendations.filter((r) => r.doneToday).length,
      assignedProgram,
    });
  } catch (error) {
    console.error('getRecommendedProgram error:', error);
    res.status(500).json({ success: false, message: 'Failed to build program recommendations' });
  }
};

export const getTherapistPrograms = async (req, res) => {
  try {
    const therapistId = req.user._id;
    const programs = await RehabilitationProgram.find({ therapistId })
      .populate('patientId', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: programs.length, programs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch therapist programs' });
  }
};
