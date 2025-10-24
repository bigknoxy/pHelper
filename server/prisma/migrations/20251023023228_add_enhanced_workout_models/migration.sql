-- CreateEnum
CREATE TYPE "public"."ExerciseCategory" AS ENUM ('STRENGTH', 'CARDIO', 'FLEXIBILITY', 'BALANCE', 'FUNCTIONAL', 'SPORTS');

-- CreateEnum
CREATE TYPE "public"."MuscleGroup" AS ENUM ('CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'FOREARMS', 'CORE', 'QUADRICEPS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'FULL_BODY');

-- CreateEnum
CREATE TYPE "public"."ExerciseDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "public"."RecordType" AS ENUM ('MAX_WEIGHT', 'MAX_REPS', 'MAX_SETS', 'PERSONAL_BEST', 'WORKOUT_VOLUME', 'EXERCISE_FREQUENCY');

-- AlterTable
ALTER TABLE "public"."Workout" ADD COLUMN     "templateId" TEXT;

-- CreateTable
CREATE TABLE "public"."Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "category" "public"."ExerciseCategory" NOT NULL,
    "muscleGroups" "public"."MuscleGroup"[],
    "equipment" TEXT[],
    "difficulty" "public"."ExerciseDifficulty" NOT NULL DEFAULT 'BEGINNER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkoutTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkoutTemplateExercise" (
    "id" TEXT NOT NULL,
    "workoutTemplateId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sets" INTEGER NOT NULL DEFAULT 1,
    "reps" INTEGER,
    "weight" DOUBLE PRECISION,
    "duration" INTEGER,
    "restTime" INTEGER,
    "order" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutTemplateExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkoutExercise" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sets" INTEGER NOT NULL DEFAULT 1,
    "reps" INTEGER,
    "weight" DOUBLE PRECISION,
    "duration" INTEGER,
    "restTime" INTEGER,
    "order" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PersonalRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "recordType" "public"."RecordType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "workoutId" TEXT,
    "workoutExerciseId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_key" ON "public"."Exercise"("name");

-- CreateIndex
CREATE INDEX "Exercise_category_idx" ON "public"."Exercise"("category");

-- CreateIndex
CREATE INDEX "Exercise_muscleGroups_idx" ON "public"."Exercise"("muscleGroups");

-- CreateIndex
CREATE INDEX "Exercise_difficulty_idx" ON "public"."Exercise"("difficulty");

-- CreateIndex
CREATE INDEX "WorkoutTemplate_createdBy_idx" ON "public"."WorkoutTemplate"("createdBy");

-- CreateIndex
CREATE INDEX "WorkoutTemplate_isPublic_idx" ON "public"."WorkoutTemplate"("isPublic");

-- CreateIndex
CREATE INDEX "WorkoutTemplate_category_idx" ON "public"."WorkoutTemplate"("category");

-- CreateIndex
CREATE INDEX "WorkoutTemplateExercise_workoutTemplateId_idx" ON "public"."WorkoutTemplateExercise"("workoutTemplateId");

-- CreateIndex
CREATE INDEX "WorkoutTemplateExercise_exerciseId_idx" ON "public"."WorkoutTemplateExercise"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutTemplateExercise_workoutTemplateId_exerciseId_order_key" ON "public"."WorkoutTemplateExercise"("workoutTemplateId", "exerciseId", "order");

-- CreateIndex
CREATE INDEX "WorkoutExercise_workoutId_idx" ON "public"."WorkoutExercise"("workoutId");

-- CreateIndex
CREATE INDEX "WorkoutExercise_exerciseId_idx" ON "public"."WorkoutExercise"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutExercise_workoutId_exerciseId_order_key" ON "public"."WorkoutExercise"("workoutId", "exerciseId", "order");

-- CreateIndex
CREATE INDEX "PersonalRecord_userId_idx" ON "public"."PersonalRecord"("userId");

-- CreateIndex
CREATE INDEX "PersonalRecord_recordType_idx" ON "public"."PersonalRecord"("recordType");

-- CreateIndex
CREATE INDEX "PersonalRecord_exerciseId_idx" ON "public"."PersonalRecord"("exerciseId");

-- CreateIndex
CREATE INDEX "PersonalRecord_date_idx" ON "public"."PersonalRecord"("date");

-- CreateIndex
CREATE INDEX "PersonalRecord_workoutId_idx" ON "public"."PersonalRecord"("workoutId");

-- CreateIndex
CREATE INDEX "PersonalRecord_workoutExerciseId_idx" ON "public"."PersonalRecord"("workoutExerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalRecord_userId_recordType_exerciseId_date_key" ON "public"."PersonalRecord"("userId", "recordType", "exerciseId", "date");

-- CreateIndex
CREATE INDEX "Workout_userId_idx" ON "public"."Workout"("userId");

-- CreateIndex
CREATE INDEX "Workout_date_idx" ON "public"."Workout"("date");

-- CreateIndex
CREATE INDEX "Workout_templateId_idx" ON "public"."Workout"("templateId");

-- AddForeignKey
ALTER TABLE "public"."Workout" ADD CONSTRAINT "Workout_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."WorkoutTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkoutTemplate" ADD CONSTRAINT "WorkoutTemplate_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkoutTemplateExercise" ADD CONSTRAINT "WorkoutTemplateExercise_workoutTemplateId_fkey" FOREIGN KEY ("workoutTemplateId") REFERENCES "public"."WorkoutTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkoutTemplateExercise" ADD CONSTRAINT "WorkoutTemplateExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "public"."Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonalRecord" ADD CONSTRAINT "PersonalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonalRecord" ADD CONSTRAINT "PersonalRecord_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonalRecord" ADD CONSTRAINT "PersonalRecord_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "public"."Workout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonalRecord" ADD CONSTRAINT "PersonalRecord_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "public"."WorkoutExercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
