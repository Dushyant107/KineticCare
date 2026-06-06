import mongoose, { Mongoose, Schema } from "mongoose";

const execriseSchema = new Schema({
  sessions: {
    type: Number,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  exercise: {
    type: String,
    required: true,
  },
  reps: {
    type: Number,
    required: true,
  },
  targetReps: {
    type: Number,
    required: true,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

const Exercise = mongoose.model("Exercise", execriseSchema);

export default Exercise;
