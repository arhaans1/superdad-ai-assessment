-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "scoreConsistency" INTEGER NOT NULL,
    "scoreOwnership" INTEGER NOT NULL,
    "scoreRelationships" INTEGER NOT NULL,
    "scoreInitiative" INTEGER NOT NULL,
    "scoreWork" INTEGER NOT NULL,
    "scoreOverall" INTEGER NOT NULL,
    "archetypeKey" TEXT NOT NULL,
    "archetypeName" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "focusShift" TEXT NOT NULL,
    "aiModel" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);
