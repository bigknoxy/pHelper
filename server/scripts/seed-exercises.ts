import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ExerciseData {
  name: string;
  description: string;
  instructions: string;
  category: 'STRENGTH' | 'CARDIO' | 'FLEXIBILITY' | 'BALANCE' | 'FUNCTIONAL' | 'SPORTS';
  muscleGroups: ('CHEST' | 'BACK' | 'SHOULDERS' | 'BICEPS' | 'TRICEPS' | 'FOREARMS' | 'CORE' | 'QUADRICEPS' | 'HAMSTRINGS' | 'GLUTES' | 'CALVES' | 'FULL_BODY')[];
  equipment: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
}

const exercises: ExerciseData[] = [
  // Strength Exercises - Chest
  {
    name: 'Bench Press',
    description: 'Classic chest exercise using a barbell or dumbbells',
    instructions: 'Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up',
    category: 'STRENGTH',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    equipment: ['Barbell', 'Bench'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Dumbbell Bench Press',
    description: 'Chest pressing movement using dumbbells for better range of motion',
    instructions: 'Lie on bench, hold dumbbells at chest level, press up until arms are extended',
    category: 'STRENGTH',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Push-ups',
    description: 'Bodyweight chest exercise',
    instructions: 'Start in plank position, lower body until chest nearly touches ground, push back up',
    category: 'STRENGTH',
    muscleGroups: ['CHEST', 'TRICEPS', 'CORE'],
    equipment: ['Bodyweight'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Incline Dumbbell Press',
    description: 'Upper chest focused pressing movement',
    instructions: 'Set bench at 30-45 degrees, press dumbbells from chest height upward',
    category: 'STRENGTH',
    muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Chest Flyes',
    description: 'Isolation exercise for chest development',
    instructions: 'Lie on bench, hold dumbbells above chest, lower in arc motion, squeeze chest to return',
    category: 'STRENGTH',
    muscleGroups: ['CHEST'],
    equipment: ['Dumbbells', 'Bench'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Dips',
    description: 'Bodyweight compound chest and tricep exercise',
    instructions: 'Support body on parallel bars, lower by bending elbows, push back up',
    category: 'STRENGTH',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    equipment: ['Parallel Bars'],
    difficulty: 'INTERMEDIATE',
  },

  // Strength Exercises - Back
  {
    name: 'Deadlift',
    description: 'Compound movement targeting entire posterior chain',
    instructions: 'Stand with feet hip-width, grip bar, lift by extending hips and knees simultaneously',
    category: 'STRENGTH',
    muscleGroups: ['BACK', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['Barbell'],
    difficulty: 'ADVANCED',
  },
  {
    name: 'Conventional Deadlift',
    description: 'Traditional deadlift variation with feet hip-width apart',
    instructions: 'Stand with feet hip-width, grip bar outside legs, lift by driving through heels',
    category: 'STRENGTH',
    muscleGroups: ['BACK', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['Barbell'],
    difficulty: 'ADVANCED',
  },
  {
    name: 'Sumo Deadlift',
    description: 'Wide-stance deadlift variation targeting inner thighs',
    instructions: 'Stand with wide stance, grip bar between legs, lift by driving through heels',
    category: 'STRENGTH',
    muscleGroups: ['BACK', 'GLUTES', 'HAMSTRINGS', 'QUADRICEPS'],
    equipment: ['Barbell'],
    difficulty: 'ADVANCED',
  },
  {
    name: 'Romanian Deadlift',
    description: 'Hip-hinge movement targeting hamstrings and glutes',
    instructions: 'Hold bar, hinge at hips keeping back flat, lower bar toward ground',
    category: 'STRENGTH',
    muscleGroups: ['HAMSTRINGS', 'GLUTES', 'BACK'],
    equipment: ['Barbell'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Pull-ups',
    description: 'Bodyweight back exercise',
    instructions: 'Hang from bar with overhand grip, pull body up until chin over bar',
    category: 'STRENGTH',
    muscleGroups: ['BACK', 'BICEPS'],
    equipment: ['Pull-up Bar'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Chin-ups',
    description: 'Underhand grip variation of pull-ups',
    instructions: 'Hang from bar with underhand grip, pull body up until chin over bar',
    category: 'STRENGTH',
    muscleGroups: ['BACK', 'BICEPS'],
    equipment: ['Pull-up Bar'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Bent Over Rows',
    description: 'Horizontal pulling movement for back thickness',
    instructions: 'Hinge at hips, pull bar or dumbbells to lower chest while keeping back flat',
    category: 'STRENGTH',
    muscleGroups: ['BACK', 'BICEPS'],
    equipment: ['Barbell', 'Dumbbells'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Lat Pulldowns',
    description: 'Vertical pulling movement using cable machine',
    instructions: 'Sit at lat pulldown station, pull bar down to upper chest',
    category: 'STRENGTH',
    muscleGroups: ['BACK', 'BICEPS'],
    equipment: ['Cable Machine'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Seated Cable Rows',
    description: 'Horizontal pulling movement using cable machine',
    instructions: 'Sit at cable row station, pull handles toward torso while keeping back straight',
    category: 'STRENGTH',
    muscleGroups: ['BACK', 'BICEPS'],
    equipment: ['Cable Machine'],
    difficulty: 'BEGINNER',
  },

  // Strength Exercises - Legs
  {
    name: 'Squats',
    description: 'Fundamental lower body compound movement',
    instructions: 'Stand with feet shoulder-width, lower by bending knees and hips, return to standing',
    category: 'STRENGTH',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['Barbell', 'Bodyweight'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Barbell Back Squat',
    description: 'Traditional squat with barbell on upper back',
    instructions: 'Place bar on upper back, squat down until thighs are parallel to ground',
    category: 'STRENGTH',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['Barbell', 'Squat Rack'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Goblet Squat',
    description: 'Front-loaded squat variation using a dumbbell or kettlebell',
    instructions: 'Hold weight at chest level, squat down keeping chest up and knees tracking over toes',
    category: 'STRENGTH',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['Dumbbell', 'Kettlebell'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Bodyweight Squat',
    description: 'Basic squat movement using only bodyweight',
    instructions: 'Stand with feet shoulder-width, lower by bending knees and hips, return to standing',
    category: 'STRENGTH',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['Bodyweight'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Lunges',
    description: 'Unilateral leg exercise for balance and strength',
    instructions: 'Step forward, lower back knee toward ground, push back to starting position',
    category: 'STRENGTH',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['Dumbbells', 'Bodyweight'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Walking Lunges',
    description: 'Dynamic lunge variation that improves coordination',
    instructions: 'Step forward into lunge, push off back foot to step forward into next lunge',
    category: 'STRENGTH',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['Dumbbells', 'Bodyweight'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Leg Press',
    description: 'Machine-based compound leg exercise',
    instructions: 'Sit in leg press machine, place feet on platform, extend legs to push weight',
    category: 'STRENGTH',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['Leg Press Machine'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Calf Raises',
    description: 'Isolation exercise for calf muscles',
    instructions: 'Stand on balls of feet, rise up onto toes, lower slowly',
    category: 'STRENGTH',
    muscleGroups: ['CALVES'],
    equipment: ['Bodyweight', 'Dumbbells'],
    difficulty: 'BEGINNER',
  },

  // Strength Exercises - Shoulders
  {
    name: 'Overhead Press',
    description: 'Compound shoulder pressing movement',
    instructions: 'Stand or sit, press bar or dumbbells from shoulder height overhead',
    category: 'STRENGTH',
    muscleGroups: ['SHOULDERS', 'TRICEPS'],
    equipment: ['Barbell', 'Dumbbells'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Barbell Overhead Press',
    description: 'Standing shoulder press with barbell',
    instructions: 'Stand with bar at shoulder height, press overhead until arms are extended',
    category: 'STRENGTH',
    muscleGroups: ['SHOULDERS', 'TRICEPS'],
    equipment: ['Barbell'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Dumbbell Shoulder Press',
    description: 'Seated or standing shoulder press with dumbbells',
    instructions: 'Sit or stand, press dumbbells from shoulder height overhead',
    category: 'STRENGTH',
    muscleGroups: ['SHOULDERS', 'TRICEPS'],
    equipment: ['Dumbbells'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Lateral Raises',
    description: 'Isolation exercise for side deltoids',
    instructions: 'Hold dumbbells at sides, raise arms out to sides until parallel to ground',
    category: 'STRENGTH',
    muscleGroups: ['SHOULDERS'],
    equipment: ['Dumbbells'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Front Raises',
    description: 'Isolation exercise for front deltoids',
    instructions: 'Hold dumbbells in front, raise arms forward until parallel to ground',
    category: 'STRENGTH',
    muscleGroups: ['SHOULDERS'],
    equipment: ['Dumbbells'],
    difficulty: 'BEGINNER',
  },

  // Strength Exercises - Arms
  {
    name: 'Bicep Curls',
    description: 'Isolation exercise for biceps',
    instructions: 'Hold dumbbells or barbell, curl weight toward shoulders keeping elbows stationary',
    category: 'STRENGTH',
    muscleGroups: ['BICEPS'],
    equipment: ['Dumbbells', 'Barbell'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Dumbbell Bicep Curls',
    description: 'Bicep curl using dumbbells for unilateral training',
    instructions: 'Stand with dumbbells at sides, curl one arm at a time toward shoulder',
    category: 'STRENGTH',
    muscleGroups: ['BICEPS'],
    equipment: ['Dumbbells'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Barbell Bicep Curls',
    description: 'Bicep curl using barbell for bilateral training',
    instructions: 'Stand with barbell, curl weight toward shoulders keeping elbows stationary',
    category: 'STRENGTH',
    muscleGroups: ['BICEPS'],
    equipment: ['Barbell'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Cable Bicep Curls',
    description: 'Bicep curl using cable machine for constant tension',
    instructions: 'Stand at cable machine, curl handle toward shoulders',
    category: 'STRENGTH',
    muscleGroups: ['BICEPS'],
    equipment: ['Cable Machine'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Tricep Extensions',
    description: 'Isolation exercise for triceps',
    instructions: 'Hold weight overhead or behind head, lower by bending elbows, extend arms',
    category: 'STRENGTH',
    muscleGroups: ['TRICEPS'],
    equipment: ['Dumbbells', 'Cable Machine'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Overhead Tricep Extension',
    description: 'Tricep extension with weight held overhead',
    instructions: 'Hold dumbbell overhead with both hands, lower behind head, extend arms',
    category: 'STRENGTH',
    muscleGroups: ['TRICEPS'],
    equipment: ['Dumbbells'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Tricep Pushdowns',
    description: 'Cable-based tricep isolation exercise',
    instructions: 'Stand at cable machine, push handle down until arms are extended',
    category: 'STRENGTH',
    muscleGroups: ['TRICEPS'],
    equipment: ['Cable Machine'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Tricep Dips',
    description: 'Bodyweight tricep exercise',
    instructions: 'Support body on parallel bars or bench, lower by bending elbows, push back up',
    category: 'STRENGTH',
    muscleGroups: ['TRICEPS'],
    equipment: ['Parallel Bars', 'Bench'],
    difficulty: 'INTERMEDIATE',
  },

  // Strength Exercises - Core
  {
    name: 'Plank',
    description: 'Isometric core stability exercise',
    instructions: 'Hold body in straight line on forearms and toes, engage core',
    category: 'STRENGTH',
    muscleGroups: ['CORE'],
    equipment: ['Bodyweight'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Russian Twists',
    description: 'Rotational core exercise',
    instructions: 'Sit with knees bent, lean back slightly, rotate torso side to side',
    category: 'STRENGTH',
    muscleGroups: ['CORE'],
    equipment: ['Medicine Ball', 'Bodyweight'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Dead Bug',
    description: 'Core stability exercise with alternating limbs',
    instructions: 'Lie on back, extend opposite arm and leg, alternate sides',
    category: 'STRENGTH',
    muscleGroups: ['CORE'],
    equipment: ['Bodyweight'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Mountain Climbers',
    description: 'Dynamic core exercise with cardio element',
    instructions: 'Start in plank position, alternate driving knees toward chest',
    category: 'STRENGTH',
    muscleGroups: ['CORE', 'SHOULDERS'],
    equipment: ['Bodyweight'],
    difficulty: 'INTERMEDIATE',
  },

  // Cardio Exercises
  {
    name: 'Running',
    description: 'Fundamental cardiovascular exercise',
    instructions: 'Run at comfortable pace, maintain good form',
    category: 'CARDIO',
    muscleGroups: ['FULL_BODY'],
    equipment: ['Running Shoes'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Treadmill Running',
    description: 'Indoor running on treadmill machine',
    instructions: 'Run on treadmill at desired speed and incline',
    category: 'CARDIO',
    muscleGroups: ['FULL_BODY'],
    equipment: ['Treadmill'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Outdoor Running',
    description: 'Running outdoors on various surfaces',
    instructions: 'Run at comfortable pace outdoors, maintain good form',
    category: 'CARDIO',
    muscleGroups: ['FULL_BODY'],
    equipment: ['Running Shoes'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Cycling',
    description: 'Low-impact cardiovascular exercise',
    instructions: 'Pedal at moderate resistance, maintain steady pace',
    category: 'CARDIO',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['Bike'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Stationary Cycling',
    description: 'Indoor cycling on stationary bike',
    instructions: 'Pedal on stationary bike at moderate resistance',
    category: 'CARDIO',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['Stationary Bike'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Outdoor Cycling',
    description: 'Cycling outdoors on roads or trails',
    instructions: 'Ride bicycle outdoors at comfortable pace',
    category: 'CARDIO',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['Bicycle'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Rowing',
    description: 'Full-body cardiovascular exercise',
    instructions: 'Use rowing machine with proper form, maintain steady rhythm',
    category: 'CARDIO',
    muscleGroups: ['BACK', 'SHOULDERS', 'CORE'],
    equipment: ['Rowing Machine'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Elliptical',
    description: 'Low-impact cardio machine',
    instructions: 'Use elliptical machine, maintain smooth motion',
    category: 'CARDIO',
    muscleGroups: ['FULL_BODY'],
    equipment: ['Elliptical Machine'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Stair Climber',
    description: 'Cardio exercise simulating stair climbing',
    instructions: 'Step on stair climber machine, maintain steady pace',
    category: 'CARDIO',
    muscleGroups: ['QUADRICEPS', 'GLUTES', 'CALVES'],
    equipment: ['Stair Climber Machine'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'Jumping Jacks',
    description: 'Bodyweight cardio exercise',
    instructions: 'Jump while spreading feet and raising arms overhead, return to start',
    category: 'CARDIO',
    muscleGroups: ['FULL_BODY'],
    equipment: ['Bodyweight'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Burpees',
    description: 'Full-body high-intensity exercise',
    instructions: 'From standing, squat down, kick feet back to plank, do push-up, jump feet forward, jump up',
    category: 'CARDIO',
    muscleGroups: ['FULL_BODY'],
    equipment: ['Bodyweight'],
    difficulty: 'ADVANCED',
  },
  {
    name: 'Jump Rope',
    description: 'Cardiovascular exercise with coordination',
    instructions: 'Jump over rope while rotating it under feet',
    category: 'CARDIO',
    muscleGroups: ['FULL_BODY'],
    equipment: ['Jump Rope'],
    difficulty: 'INTERMEDIATE',
  },
  {
    name: 'High Knees',
    description: 'Running in place with exaggerated knee lift',
    instructions: 'Run in place, driving knees high toward chest',
    category: 'CARDIO',
    muscleGroups: ['CORE', 'QUADRICEPS'],
    equipment: ['Bodyweight'],
    difficulty: 'INTERMEDIATE',
  },

  // Flexibility & Mobility Exercises
  {
    name: 'Downward Dog',
    description: 'Yoga pose for flexibility and strength',
    instructions: 'From plank position, push hips up and back, forming inverted V',
    category: 'FLEXIBILITY',
    muscleGroups: ['HAMSTRINGS', 'CALVES', 'SHOULDERS'],
    equipment: ['Yoga Mat'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Cat-Cow Stretch',
    description: 'Spinal mobility exercise',
    instructions: 'On all fours, alternate between arching and rounding back',
    category: 'FLEXIBILITY',
    muscleGroups: ['BACK', 'CORE'],
    equipment: ['Yoga Mat'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Shoulder Stretch',
    description: 'Upper body mobility exercise',
    instructions: 'Bring one arm across body, use other arm to gently pull',
    category: 'FLEXIBILITY',
    muscleGroups: ['SHOULDERS'],
    equipment: ['Bodyweight'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Hamstring Stretch',
    description: 'Lower body flexibility exercise',
    instructions: 'Sit with legs extended, reach toward toes while keeping back straight',
    category: 'FLEXIBILITY',
    muscleGroups: ['HAMSTRINGS'],
    equipment: ['Bodyweight'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Quad Stretch',
    description: 'Quadriceps flexibility exercise',
    instructions: 'Stand on one leg, pull other foot toward glutes',
    category: 'FLEXIBILITY',
    muscleGroups: ['QUADRICEPS'],
    equipment: ['Bodyweight'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Chest Opener',
    description: 'Chest and shoulder mobility exercise',
    instructions: 'Clasp hands behind back, lift arms while opening chest',
    category: 'FLEXIBILITY',
    muscleGroups: ['CHEST', 'SHOULDERS'],
    equipment: ['Bodyweight'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Hip Flexor Stretch',
    description: 'Hip mobility exercise',
    instructions: 'Kneel on one knee, push hips forward while keeping torso upright',
    category: 'FLEXIBILITY',
    muscleGroups: ['QUADRICEPS'],
    equipment: ['Bodyweight'],
    difficulty: 'BEGINNER',
  },
  {
    name: 'Foam Rolling',
    description: 'Self-myofascial release for muscle recovery',
    instructions: 'Use foam roller on various muscle groups, hold on tight spots',
    category: 'FLEXIBILITY',
    muscleGroups: ['FULL_BODY'],
    equipment: ['Foam Roller'],
    difficulty: 'BEGINNER',
  },
];

async function seedExercises() {
  console.log('Starting exercise seeding...');

  let createdCount = 0;
  let skippedCount = 0;

  for (const exerciseData of exercises) {
    try {
      const existingExercise = await prisma.exercise.findUnique({
        where: { name: exerciseData.name }
      });

      if (existingExercise) {
        console.log(`Skipping existing exercise: ${exerciseData.name}`);
        skippedCount++;
      } else {
        await prisma.exercise.create({
          data: exerciseData
        });
        console.log(`Created exercise: ${exerciseData.name}`);
        createdCount++;
      }
    } catch (error) {
      console.error(`Error creating exercise ${exerciseData.name}:`, error);
    }
  }

  console.log(`\nExercise seeding completed!`);
  console.log(`Created: ${createdCount} exercises`);
  console.log(`Skipped: ${skippedCount} existing exercises`);
  console.log(`Total exercises in library: ${exercises.length}`);
}

async function main() {
  try {
    await seedExercises();
  } catch (error) {
    console.error('Error during exercise seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { seedExercises };