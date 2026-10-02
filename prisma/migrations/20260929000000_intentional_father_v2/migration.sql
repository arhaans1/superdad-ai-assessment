-- Preserve the original assessment columns for historical submissions while
-- allowing v2 submissions to use the seven-gap model.
ALTER TABLE "Submission"
  ADD COLUMN "fatherhoodStage" TEXT,
  ADD COLUMN "scoreIdentity" INTEGER,
  ADD COLUMN "scoreConditioning" INTEGER,
  ADD COLUMN "scoreResponsibility" INTEGER,
  ADD COLUMN "scoreEmotional" INTEGER,
  ADD COLUMN "scoreDecisionMaking" INTEGER,
  ADD COLUMN "scoreFear" INTEGER,
  ADD COLUMN "scoreAlignment" INTEGER,
  ADD COLUMN "reportJson" JSONB,
  ADD COLUMN "assessmentVersion" TEXT NOT NULL DEFAULT 'legacy';

ALTER TABLE "Submission"
  ALTER COLUMN "assessmentVersion" SET DEFAULT 'intentional-father-v2';

ALTER TABLE "Submission"
  ALTER COLUMN "scoreConsistency" DROP NOT NULL,
  ALTER COLUMN "scoreOwnership" DROP NOT NULL,
  ALTER COLUMN "scoreRelationships" DROP NOT NULL,
  ALTER COLUMN "scoreInitiative" DROP NOT NULL,
  ALTER COLUMN "scoreWork" DROP NOT NULL,
  ALTER COLUMN "scoreOverall" DROP NOT NULL;

CREATE TABLE "AssessmentSettings" (
  "id" TEXT NOT NULL DEFAULT 'primary',
  "videoUrl" TEXT NOT NULL DEFAULT '',
  "bookingUrl" TEXT NOT NULL DEFAULT '',
  "videoEnabled" BOOLEAN NOT NULL DEFAULT false,
  "bookingEnabled" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AssessmentSettings_pkey" PRIMARY KEY ("id")
);
