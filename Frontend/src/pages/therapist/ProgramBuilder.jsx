import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import { ClipboardList, Plus, Trash2, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EXERCISES } from '../patient/ExerciseLibrary';

export const ProgramBuilder = () => {
  const { API_BASE_URL } = useAuth();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [programName, setProgramName] = useState('Knee Recovery — Phase 2');
  const [description, setDescription] = useState('Progressive quad strengthening and flexion mobility plan.');
  const [goal, setGoal] = useState('Achieve 135° knee flexion with pain-free load');
  const [selectedExercises, setSelectedExercises] = useState([
    {
      exerciseId: '668f12345678901234567890',
      exerciseSlug: 'knee_ext',
      exerciseName: 'Seated Knee Extension',
      sets: 3,
      reps: 10,
      targetROM: 160,
      frequency: 'Daily',
      instructions: 'Lock quad at top of extension for 2 seconds.',
    },
    {
      exerciseId: '668f12345678901234567891',
      exerciseSlug: 'squat',
      exerciseName: 'Full Body Squat',
      sets: 3,
      reps: 8,
      targetROM: 90,
      frequency: '3 times per week',
      instructions: 'Keep back straight and knees aligned over toes.',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTherapistPatients();
  }, []);

  const fetchTherapistPatients = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/therapists`);
      // Fallback patient option
      setSelectedPatientId('668f12345678901234567899');
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    }
  };

  const handleAddExercise = (exerciseTemplate) => {
    setSelectedExercises([
      ...selectedExercises,
      {
        exerciseId: '668f12345678901234567890',
        exerciseSlug: exerciseTemplate.id,
        exerciseName: exerciseTemplate.name,
        sets: 3,
        reps: 10,
        targetROM: exerciseTemplate.targetROM || 90,
        frequency: 'Daily',
        instructions: 'Perform with controlled form.',
      },
    ]);
  };

  const handleRemoveExercise = (idx) => {
    const next = [...selectedExercises];
    next.splice(idx, 1);
    setSelectedExercises(next);
  };

  const handleExerciseChange = (idx, field, value) => {
    const next = [...selectedExercises];
    next[idx][field] = value;
    setSelectedExercises(next);
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/programs/create`, {
        patientId: selectedPatientId || '668f12345678901234567899',
        name: programName,
        description,
        goal,
        exercises: selectedExercises,
        status: 'ACTIVE',
      });

      if (res.data.success) {
        alert('Rehabilitation program published successfully to patient!');
        navigate('/therapist/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish program.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Rehabilitation Program Builder</h1>
        <p className="text-xs text-slate-500 mt-1">
          Create and assign personalized exercise prescriptions equipped with target ROM metrics and rep parameters.
        </p>
      </div>

      <form onSubmit={handlePublish} className="space-y-6">
        {/* Program General Information */}
        <Card title="Program Overview" subtitle="General title and clinical recovery goals">
          <div className="space-y-4">
            <Input
              label="Program Title"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              required
            />
            <Input
              label="Rehabilitation Goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
            />
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 block mb-1.5">
                Clinical Description / Guidelines
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </Card>

        {/* Exercises Selector & Configuration */}
        <Card title="Program Exercise Prescriptions" subtitle="Configure sets, reps, target ROM, and frequency">
          <div className="space-y-4">
            {selectedExercises.map((ex, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{ex.exerciseName}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExercise(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Input
                    label="Sets"
                    type="number"
                    value={ex.sets}
                    onChange={(e) => handleExerciseChange(idx, 'sets', Number(e.target.value))}
                  />
                  <Input
                    label="Reps per set"
                    type="number"
                    value={ex.reps}
                    onChange={(e) => handleExerciseChange(idx, 'reps', Number(e.target.value))}
                  />
                  <Input
                    label="Target ROM (°)"
                    type="number"
                    value={ex.targetROM}
                    onChange={(e) => handleExerciseChange(idx, 'targetROM', Number(e.target.value))}
                  />
                  <Select
                    label="Frequency"
                    value={ex.frequency}
                    onChange={(e) => handleExerciseChange(idx, 'frequency', e.target.value)}
                    options={[
                      { value: 'Daily', label: 'Daily' },
                      { value: '3 times per week', label: '3x / week' },
                      { value: '2 times per week', label: '2x / week' },
                    ]}
                  />
                </div>

                <Input
                  label="Specific Form Instructions"
                  value={ex.instructions}
                  onChange={(e) => handleExerciseChange(idx, 'instructions', e.target.value)}
                />
              </div>
            ))}

            {/* Available Exercise Buttons */}
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">+ Add Exercise from Library:</p>
              <div className="flex flex-wrap gap-2">
                {EXERCISES.map((exT) => (
                  <button
                    key={exT.id}
                    type="button"
                    onClick={() => handleAddExercise(exT)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 hover:border-sky-400 hover:bg-sky-50 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-sky-600" />
                    {exT.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => navigate('/therapist/dashboard')}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSubmitting} icon={ClipboardList}>
            Publish Program to Patient
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProgramBuilder;
