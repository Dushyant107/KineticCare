import Exercise from "../models/exerciseModel.js";

export const saveExerciseData = async (req, res) => {
  try {
    const exercises = await exercise.create({ ...req.body, userId: req.user._id });
    res.status(201).json(exercise);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export const getUserExerciseData = async (req, res) => {
  const exercises = await exercise.find({ userId: req.user._id }).sort({
    completedAt: -1,
  });
  res.json(exercises);
}; 

