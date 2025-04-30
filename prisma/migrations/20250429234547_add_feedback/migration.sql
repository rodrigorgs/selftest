-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "flaggedExcellent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "flaggedIncorrect" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "flaggedProblematic" BOOLEAN NOT NULL DEFAULT false;
