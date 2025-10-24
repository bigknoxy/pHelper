import { PrismaClient, ExerciseCategory, MuscleGroup, ExerciseDifficulty } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const passwordHash = await bcrypt.hash('testpassword', 10);
  const user = await prisma.user.upsert({
    where: { email: 'testuser@example.com' },
    update: {},
    create: {
      email: 'testuser@example.com',
      passwordHash,
    },
  });

  // Seed weight entries
  await prisma.weightEntry.createMany({
    data: [
      {
        userId: user.id,
        date: new Date('2025-09-01'),
        weight: 180,
        note: 'Morning weigh-in',
        createdAt: new Date('2025-09-01T08:00:00Z'),
        updatedAt: new Date('2025-09-01T08:00:00Z'),
      },
      {
        userId: user.id,
        date: new Date('2025-09-02'),
        weight: 179.5,
        note: 'Evening weigh-in',
        createdAt: new Date('2025-09-02T20:00:00Z'),
        updatedAt: new Date('2025-09-02T20:00:00Z'),
      },
    ],
  });

  // Seed workouts
  await prisma.workout.createMany({
    data: [
      {
        userId: user.id,
        date: new Date('2025-09-01'),
        type: 'Running',
        duration: 30,
        notes: '5k run',
        createdAt: new Date('2025-09-01T09:00:00Z'),
        updatedAt: new Date('2025-09-01T09:00:00Z'),
      },
      {
        userId: user.id,
        date: new Date('2025-09-02'),
        type: 'Cycling',
        duration: 45,
        notes: 'Indoor bike',
        createdAt: new Date('2025-09-02T18:00:00Z'),
        updatedAt: new Date('2025-09-02T18:00:00Z'),
      },
    ],
  });

   // Seed tasks
   await prisma.task.createMany({
     data: [
       {
         userId: user.id,
         title: 'Buy groceries',
         description: 'Milk, eggs, bread',
         status: 'PENDING',
         dueDate: new Date('2025-09-03'),
         createdAt: new Date('2025-09-01T10:00:00Z'),
         updatedAt: new Date('2025-09-01T10:00:00Z'),
       },
       {
         userId: user.id,
         title: 'Read book',
         description: 'Finish reading chapter 5',
         status: 'COMPLETED',
         dueDate: new Date('2025-09-04'),
         createdAt: new Date('2025-09-02T11:00:00Z'),
         updatedAt: new Date('2025-09-02T11:00:00Z'),
       },
     ],
   });

   // Seed exercises
   const exercises = [
     // Chest exercises
     {
       name: 'Bench Press',
       description: 'Classic chest exercise using a barbell or dumbbells',
       instructions: 'Lie on bench, grip bar slightly wider than shoulders, lower to chest, press up',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.CHEST, MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS],
       equipment: ['Barbell', 'Bench'],
        difficulty: ExerciseDifficulty.INTERMEDIATE,
     },
     {
       name: 'Push-ups',
       description: 'Bodyweight chest exercise',
       instructions: 'Start in plank position, lower body until chest nearly touches ground, push back up',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.CHEST, MuscleGroup.TRICEPS, MuscleGroup.CORE],
       equipment: ['Bodyweight'],
        difficulty: ExerciseDifficulty.BEGINNER,
     },
     {
       name: 'Incline Dumbbell Press',
       description: 'Upper chest focused pressing movement',
       instructions: 'Set bench at 30-45 degrees, press dumbbells from chest height upward',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
       equipment: ['Dumbbells', 'Bench'],
        difficulty: ExerciseDifficulty.INTERMEDIATE,
     },
     {
       name: 'Chest Flyes',
       description: 'Isolation exercise for chest development',
       instructions: 'Lie on bench, hold dumbbells above chest, lower in arc motion, squeeze chest to return',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.CHEST],
       equipment: ['Dumbbells', 'Bench'],
        difficulty: ExerciseDifficulty.INTERMEDIATE,
     },

     // Back exercises
     {
       name: 'Deadlift',
       description: 'Compound movement targeting entire posterior chain',
       instructions: 'Stand with feet hip-width, grip bar, lift by extending hips and knees simultaneously',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.BACK, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
       equipment: ['Barbell'],
        difficulty: ExerciseDifficulty.ADVANCED,
     },
     {
       name: 'Pull-ups',
       description: 'Bodyweight back exercise',
       instructions: 'Hang from bar with overhand grip, pull body up until chin over bar',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.BACK, MuscleGroup.BICEPS],
       equipment: ['Pull-up Bar'],
        difficulty: ExerciseDifficulty.INTERMEDIATE,
     },
     {
       name: 'Bent Over Rows',
       description: 'Horizontal pulling movement for back thickness',
       instructions: 'Hinge at hips, pull bar or dumbbells to lower chest while keeping back flat',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.BACK, MuscleGroup.BICEPS],
       equipment: ['Barbell', 'Dumbbells'],
        difficulty: ExerciseDifficulty.INTERMEDIATE,
     },
     {
       name: 'Lat Pulldowns',
       description: 'Vertical pulling movement using cable machine',
       instructions: 'Sit at lat pulldown station, pull bar down to upper chest',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.BACK, MuscleGroup.BICEPS],
       equipment: ['Cable Machine'],
        difficulty: ExerciseDifficulty.BEGINNER,
     },

     // Leg exercises
     {
       name: 'Squats',
       description: 'Fundamental lower body compound movement',
       instructions: 'Stand with feet shoulder-width, lower by bending knees and hips, return to standing',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.QUADRICEPS, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
       equipment: ['Barbell', 'Bodyweight'],
        difficulty: ExerciseDifficulty.INTERMEDIATE,
     },
     {
       name: 'Lunges',
       description: 'Unilateral leg exercise for balance and strength',
       instructions: 'Step forward, lower back knee toward ground, push back to starting position',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.QUADRICEPS, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
       equipment: ['Dumbbells', 'Bodyweight'],
        difficulty: ExerciseDifficulty.INTERMEDIATE,
     },
     {
       name: 'Leg Press',
       description: 'Machine-based compound leg exercise',
       instructions: 'Sit in leg press machine, place feet on platform, extend legs to push weight',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.QUADRICEPS, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
       equipment: ['Leg Press Machine'],
        difficulty: ExerciseDifficulty.BEGINNER,
     },
     {
       name: 'Romanian Deadlift',
       description: 'Hip-hinge movement targeting hamstrings and glutes',
       instructions: 'Hold bar, hinge at hips keeping back flat, lower bar toward ground',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.HAMSTRINGS, MuscleGroup.GLUTES, MuscleGroup.BACK],
       equipment: ['Barbell'],
        difficulty: ExerciseDifficulty.INTERMEDIATE,
     },

     // Shoulder exercises
     {
       name: 'Overhead Press',
       description: 'Compound shoulder pressing movement',
       instructions: 'Stand or sit, press bar or dumbbells from shoulder height overhead',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
       equipment: ['Barbell', 'Dumbbells'],
        difficulty: ExerciseDifficulty.INTERMEDIATE,
     },
     {
       name: 'Lateral Raises',
       description: 'Isolation exercise for side deltoids',
       instructions: 'Hold dumbbells at sides, raise arms out to sides until parallel to ground',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.SHOULDERS],
       equipment: ['Dumbbells'],
        difficulty: ExerciseDifficulty.BEGINNER,
     },
     {
       name: 'Front Raises',
       description: 'Isolation exercise for front deltoids',
       instructions: 'Hold dumbbells in front, raise arms forward until parallel to ground',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.SHOULDERS],
       equipment: ['Dumbbells'],
        difficulty: ExerciseDifficulty.BEGINNER,
     },

     // Arm exercises
     {
       name: 'Bicep Curls',
       description: 'Isolation exercise for biceps',
       instructions: 'Hold dumbbells or barbell, curl weight toward shoulders keeping elbows stationary',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.BICEPS],
       equipment: ['Dumbbells', 'Barbell'],
        difficulty: ExerciseDifficulty.BEGINNER,
     },
     {
       name: 'Tricep Dips',
       description: 'Bodyweight tricep exercise',
       instructions: 'Support body on parallel bars or bench, lower by bending elbows, push back up',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.TRICEPS],
       equipment: ['Parallel Bars', 'Bench'],
        difficulty: ExerciseDifficulty.INTERMEDIATE,
     },
     {
       name: 'Hammer Curls',
       description: 'Bicep exercise with neutral grip',
       instructions: 'Hold dumbbells with neutral grip, curl toward shoulders',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.BICEPS, MuscleGroup.FOREARMS],
       equipment: ['Dumbbells'],
        difficulty: ExerciseDifficulty.BEGINNER,
     },

     // Core exercises
     {
       name: 'Plank',
       description: 'Isometric core stability exercise',
       instructions: 'Hold body in straight line on forearms and toes, engage core',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.CORE],
       equipment: ['Bodyweight'],
        difficulty: ExerciseDifficulty.BEGINNER,
     },
     {
       name: 'Russian Twists',
       description: 'Rotational core exercise',
       instructions: 'Sit with knees bent, lean back slightly, rotate torso side to side',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.CORE],
       equipment: ['Medicine Ball', 'Bodyweight'],
        difficulty: ExerciseDifficulty.BEGINNER,
     },
     {
       name: 'Dead Bug',
       description: 'Core stability exercise with alternating limbs',
       instructions: 'Lie on back, extend opposite arm and leg, alternate sides',
        category: ExerciseCategory.STRENGTH,
        muscleGroups: [MuscleGroup.CORE],
       equipment: ['Bodyweight'],
        difficulty: ExerciseDifficulty.INTERMEDIATE,
     },

     // Cardio exercises
     {
       name: 'Running',
       description: 'Fundamental cardiovascular exercise',
       instructions: 'Run at comfortable pace, maintain good form',
        category: ExerciseCategory.CARDIO,
        muscleGroups: [MuscleGroup.FULL_BODY],
       equipment: ['Running Shoes'],
        difficulty: ExerciseDifficulty.BEGINNER,
     },
     {
       name: 'Cycling',
       description: 'Low-impact cardiovascular exercise',
       instructions: 'Pedal at moderate resistance, maintain steady pace',
        category: ExerciseCategory.CARDIO,
        muscleGroups: [MuscleGroup.QUADRICEPS, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
       equipment: ['Bike'],
        difficulty: ExerciseDifficulty.BEGINNER,
     },
     {
       name: 'Burpees',
       description: 'Full-body high-intensity exercise',
       instructions: 'From standing, squat down, kick feet back to plank, do push-up, jump feet forward, jump up',
        category: ExerciseCategory.CARDIO,
        muscleGroups: [MuscleGroup.FULL_BODY],
       equipment: ['Bodyweight'],
        difficulty: ExerciseDifficulty.ADVANCED,
     },
     {
       name: 'Jump Rope',
       description: 'Cardiovascular exercise with coordination',
       instructions: 'Jump over rope while rotating it under feet',
        category: ExerciseCategory.CARDIO,
        muscleGroups: [MuscleGroup.FULL_BODY],
       equipment: ['Jump Rope'],
        difficulty: ExerciseDifficulty.INTERMEDIATE,
     },

     // Flexibility exercises
     {
       name: 'Downward Dog',
       description: 'Yoga pose for flexibility and strength',
       instructions: 'From plank position, push hips up and back, forming inverted V',
        category: ExerciseCategory.FLEXIBILITY,
        muscleGroups: [MuscleGroup.HAMSTRINGS, MuscleGroup.CALVES, MuscleGroup.SHOULDERS],
       equipment: ['Yoga Mat'],
        difficulty: ExerciseDifficulty.BEGINNER,
     },
     {
       name: 'Cat-Cow Stretch',
       description: 'Spinal mobility exercise',
       instructions: 'On all fours, alternate between arching and rounding back',
        category: ExerciseCategory.FLEXIBILITY,
        muscleGroups: [MuscleGroup.BACK, MuscleGroup.CORE],
       equipment: ['Yoga Mat'],
        difficulty: ExerciseDifficulty.BEGINNER,
     },
     {
       name: 'Shoulder Stretch',
       description: 'Upper body mobility exercise',
       instructions: 'Bring one arm across body, use other arm to gently pull',
        category: ExerciseCategory.FLEXIBILITY,
        muscleGroups: [MuscleGroup.SHOULDERS],
       equipment: ['Bodyweight'],
        difficulty: ExerciseDifficulty.BEGINNER,
     },

     // Balance exercises
     {
       name: 'Single Leg Balance',
       description: 'Proprioception and stability exercise',
       instructions: 'Stand on one leg, maintain balance for time, switch legs',
        category: ExerciseCategory.BALANCE,
        muscleGroups: [MuscleGroup.CORE, MuscleGroup.GLUTES],
       equipment: ['Bodyweight'],
        difficulty: ExerciseDifficulty.BEGINNER,
     },
     {
       name: 'Bird Dog',
       description: 'Core stability and balance exercise',
       instructions: 'On all fours, extend opposite arm and leg, hold, switch sides',
        category: ExerciseCategory.BALANCE,
        muscleGroups: [MuscleGroup.CORE, MuscleGroup.BACK],
       equipment: ['Bodyweight'],
        difficulty: ExerciseDifficulty.INTERMEDIATE,
     },

     // Sports-specific exercises
     {
       name: 'Medicine Ball Slams',
       description: 'Power development exercise',
       instructions: 'Lift medicine ball overhead, slam down to ground with force',
        category: ExerciseCategory.SPORTS,
        muscleGroups: [MuscleGroup.FULL_BODY],
       equipment: ['Medicine Ball'],
        difficulty: ExerciseDifficulty.INTERMEDIATE,
     },
     {
       name: 'Agility Ladder Drills',
       description: 'Footwork and coordination training',
       instructions: 'Perform various patterns through agility ladder',
        category: ExerciseCategory.SPORTS,
        muscleGroups: [MuscleGroup.FULL_BODY],
       equipment: ['Agility Ladder'],
        difficulty: ExerciseDifficulty.INTERMEDIATE,
     },
   ];

    // Create exercises
    for (const exerciseData of exercises) {
      await prisma.exercise.upsert({
        where: { name: exerciseData.name },
        update: {},
        create: exerciseData,
      });
    }

    // Get exercise IDs for seeding workout exercises
    const runningExercise = await prisma.exercise.findUnique({ where: { name: 'Running' } });
    const cyclingExercise = await prisma.exercise.findUnique({ where: { name: 'Cycling' } });
    const benchPressExercise = await prisma.exercise.findUnique({ where: { name: 'Bench Press' } });
    const squatsExercise = await prisma.exercise.findUnique({ where: { name: 'Squats' } });

    // Get workout IDs
    const runningWorkout = await prisma.workout.findFirst({ where: { type: 'Running', userId: user.id } });
    const cyclingWorkout = await prisma.workout.findFirst({ where: { type: 'Cycling', userId: user.id } });

    // Seed workout exercises
    if (runningWorkout && runningExercise) {
      await prisma.workoutExercise.create({
        data: {
          workoutId: runningWorkout.id,
          exerciseId: runningExercise.id,
          sets: 1,
          duration: 1800, // 30 minutes in seconds
          distance: 5.0, // 5 km
          calories: 300,
          order: 1,
          notes: '5k run',
        },
      });
    }

    if (cyclingWorkout && cyclingExercise) {
      await prisma.workoutExercise.create({
        data: {
          workoutId: cyclingWorkout.id,
          exerciseId: cyclingExercise.id,
          sets: 1,
          duration: 2700, // 45 minutes in seconds
          distance: 15.0, // 15 km
          calories: 450,
          order: 1,
          notes: 'Indoor bike',
        },
      });
    }

    // Add strength exercises for variety
    if (runningWorkout && benchPressExercise) {
      await prisma.workoutExercise.create({
        data: {
          workoutId: runningWorkout.id,
          exerciseId: benchPressExercise.id,
          sets: 3,
          reps: 10,
          weight: 135,
          order: 2,
          notes: 'Bench press after run',
        },
      });
    }

    if (cyclingWorkout && squatsExercise) {
      await prisma.workoutExercise.create({
        data: {
          workoutId: cyclingWorkout.id,
          exerciseId: squatsExercise.id,
          sets: 3,
          reps: 12,
          weight: 185,
          order: 2,
          notes: 'Squats after cycling',
        },
      });
    }

    console.log('Seeded exercises:', exercises.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
