import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Search, Video, Info, Dumbbell, ShieldAlert, CheckCircle } from 'lucide-react';

export const EXERCISES = [
  {
    id: 'knee_ext',
    name: 'Seated Knee Extension',
    bodyPart: 'Knee',
    difficulty: 'Easy',
    targetROM: 160,
    equipment: 'Chair',
    description: 'Sit upright in a chair and extend your lower leg forward until horizontal to strengthen quadriceps stability.',
    instructions: [
      'Sit upright in a sturdy chair with back supported and feet flat.',
      'Slowly extend your lower leg upward until knee is straight.',
      'Hold at peak extension for 2 seconds to engage quads.',
      'Lower leg slowly back down to starting position.',
    ],
    targetMuscles: ['Quadriceps', 'Patellar Tendon'],
    safetyTips: 'Do not lock out the knee aggressively. Keep the movement smooth.',
  },
  {
    id: 'left_curl',
    name: 'Left Arm Bicep Curl',
    bodyPart: 'Arm',
    difficulty: 'Easy',
    targetROM: 140,
    equipment: 'None / Light Dumbbell',
    description: 'Biceps flexion mobility exercise keeping upper arm locked tightly to ribs.',
    instructions: [
      'Stand or sit upright.',
      'Keep left upper arm locked tightly against ribs.',
      'Bend elbow to bring wrist toward shoulder.',
      'Lower slowly back down to full arm extension.',
    ],
    targetMuscles: ['Biceps Brachii', 'Brachialis'],
    safetyTips: 'Avoid swinging your torso or using momentum.',
  },
  {
    id: 'right_curl',
    name: 'Right Arm Bicep Curl',
    bodyPart: 'Arm',
    difficulty: 'Easy',
    targetROM: 140,
    equipment: 'None / Light Dumbbell',
    description: 'Right arm bicep flexion exercise for elbow mobility.',
    instructions: [
      'Stand straight with right arm at side.',
      'Curl wrist upward to shoulder height.',
      'Lower hand smoothly to starting position.',
    ],
    targetMuscles: ['Biceps Brachii'],
    safetyTips: 'Maintain tight elbow alignment.',
  },
  {
    id: 'squat',
    name: 'Full Body Squat',
    bodyPart: 'Full Body',
    difficulty: 'Medium',
    targetROM: 90,
    equipment: 'Bodyweight',
    description: 'Controlled squat movement to improve hip, knee, and ankle joint stability.',
    instructions: [
      'Stand with feet shoulder-width apart and chest high.',
      'Push hips back and bend knees as if sitting down.',
      'Lower until knees reach 90 degrees bend.',
      'Push through heels to return to standing.',
    ],
    targetMuscles: ['Quadriceps', 'Gluteus Maximus', 'Hamstrings'],
    safetyTips: 'Keep knees tracking over toes. Do not let knees cave inward.',
  },
  {
    id: 'shoulder_lat',
    name: 'Lateral Shoulder Raise',
    bodyPart: 'Shoulder',
    difficulty: 'Medium',
    targetROM: 90,
    equipment: 'None',
    description: 'Raise straight arm out to the side into a T-shape for deltoid abduction.',
    instructions: [
      'Stand tall with arms resting at sides.',
      'Keep arm completely straight.',
      'Raise arm out to the side until parallel with floor.',
      'Lower slowly under control.',
    ],
    targetMuscles: ['Lateral Deltoids', 'Supraspinatus'],
    safetyTips: 'Stop if you feel sharp impingement in the shoulder socket.',
  },
  {
    id: 'shoulder_front',
    name: 'Front Shoulder Raise',
    bodyPart: 'Shoulder',
    difficulty: 'Easy',
    targetROM: 90,
    equipment: 'None',
    description: 'Raise straight arm forward directly in front of torso to shoulder height.',
    instructions: [
      'Stand straight with arm at side.',
      'Raise arm forward smoothly.',
      'Pause briefly at parallel height.',
      'Lower under control.',
    ],
    targetMuscles: ['Anterior Deltoid', 'Pectoralis Major'],
    safetyTips: 'Keep back erect without leaning backwards.',
  },
  {
    id: 'wall_slides',
    name: 'Standing Wall Slide',
    bodyPart: 'Spine & Shoulder',
    difficulty: 'Easy',
    targetROM: 150,
    equipment: 'Wall',
    description: 'Slide forearms vertically against a smooth wall to enhance scapular stability.',
    instructions: [
      'Stand facing a flat wall.',
      'Place forearms against wall.',
      'Slide hands upward gently.',
      'Control descent back to shoulder level.',
    ],
    targetMuscles: ['Trapezius', 'Serratus Anterior'],
    safetyTips: 'Keep forearms flush against the wall.',
  },
  {
    id: 'hip_abduction',
    name: 'Side Hip Abduction',
    bodyPart: 'Hip',
    difficulty: 'Medium',
    targetROM: 45,
    equipment: 'Support Bar',
    description: 'Raise leg sideways while standing straight to stabilize hip adductors.',
    instructions: [
      'Stand erect holding support.',
      'Raise leg sideways outward.',
      'Lower slowly.',
    ],
    targetMuscles: ['Gluteus Medius'],
    safetyTips: 'Avoid tilting your pelvis to force height.',
  },
];

export const ExerciseLibrary = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const navigate = useNavigate();

  const categories = ['All', 'Knee', 'Arm', 'Shoulder', 'Hip', 'Spine & Shoulder', 'Full Body'];

  const filteredExercises = EXERCISES.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) || ex.bodyPart.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || ex.bodyPart === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Exercise Library</h1>
        <p className="text-xs text-slate-500 mt-1">
          Browse therapeutic exercises equipped with computer vision pose analysis and landmark tracking.
        </p>
      </div>

      {/* Filter & Search */}
      <Card className="p-4 border-slate-200">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-72">
            <Input
              placeholder="Search exercise name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((ex) => (
          <Card key={ex.id} className="hover:shadow-md transition-all border-slate-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={ex.bodyPart === 'Knee' ? 'primary' : ex.bodyPart === 'Arm' ? 'info' : 'warning'}>
                  {ex.bodyPart}
                </Badge>
                <Badge variant={ex.difficulty === 'Easy' ? 'success' : 'neutral'}>{ex.difficulty}</Badge>
              </div>

              <h3 className="text-base font-bold text-slate-900">{ex.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{ex.description}</p>

              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 space-y-1">
                <p><span className="font-semibold text-slate-700">Target ROM:</span> {ex.targetROM}°</p>
                <p><span className="font-semibold text-slate-700">Muscles:</span> {ex.targetMuscles.join(', ')}</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                icon={Info}
                onClick={() => setSelectedExercise(ex)}
              >
                Guide
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                icon={Video}
                onClick={() => navigate(`/live-session?exercise=${ex.id}`)}
              >
                Start AI Session
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Exercise Detail Modal */}
      <Modal
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        title={selectedExercise?.name}
        subtitle={`${selectedExercise?.bodyPart} Rehabilitation Exercise`}
      >
        {selectedExercise && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">{selectedExercise.description}</p>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Instructions</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                {selectedExercise.instructions.map((inst, idx) => (
                  <li key={idx} className="leading-relaxed">{inst}</li>
                ))}
              </ol>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Safety Note:</span> {selectedExercise.safetyTips}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedExercise(null)}>Close</Button>
              <Button
                variant="primary"
                icon={Video}
                onClick={() => {
                  const id = selectedExercise.id;
                  setSelectedExercise(null);
                  navigate(`/live-session?exercise=${id}`);
                }}
              >
                Start AI Session Now
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExerciseLibrary;
