-- CreateTable
CREATE TABLE "public"."WeightGoal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "goalWeight" DOUBLE PRECISION NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "bmiTracking" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeightGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WeightMilestone" (
    "id" TEXT NOT NULL,
    "weightGoalId" TEXT NOT NULL,
    "milestoneWeight" DOUBLE PRECISION NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "achieved" BOOLEAN NOT NULL DEFAULT false,
    "achievedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeightMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProgressPhoto" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgressPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BodyComposition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bodyFat" DOUBLE PRECISION,
    "muscleMass" DOUBLE PRECISION,
    "measurements" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BodyComposition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeightGoal_userId_idx" ON "public"."WeightGoal"("userId");

-- CreateIndex
CREATE INDEX "WeightGoal_targetDate_idx" ON "public"."WeightGoal"("targetDate");

-- CreateIndex
CREATE INDEX "WeightMilestone_weightGoalId_idx" ON "public"."WeightMilestone"("weightGoalId");

-- CreateIndex
CREATE INDEX "WeightMilestone_targetDate_idx" ON "public"."WeightMilestone"("targetDate");

-- CreateIndex
CREATE INDEX "ProgressPhoto_userId_idx" ON "public"."ProgressPhoto"("userId");

-- CreateIndex
CREATE INDEX "ProgressPhoto_date_idx" ON "public"."ProgressPhoto"("date");

-- CreateIndex
CREATE INDEX "BodyComposition_userId_idx" ON "public"."BodyComposition"("userId");

-- CreateIndex
CREATE INDEX "BodyComposition_date_idx" ON "public"."BodyComposition"("date");

-- AddForeignKey
ALTER TABLE "public"."WeightGoal" ADD CONSTRAINT "WeightGoal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WeightMilestone" ADD CONSTRAINT "WeightMilestone_weightGoalId_fkey" FOREIGN KEY ("weightGoalId") REFERENCES "public"."WeightGoal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProgressPhoto" ADD CONSTRAINT "ProgressPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BodyComposition" ADD CONSTRAINT "BodyComposition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
