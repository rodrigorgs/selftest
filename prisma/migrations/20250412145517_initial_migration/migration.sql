/*
  Warnings:

  - Added the required column `ownerId` to the `QuestionRequestTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuestionRequestTemplate" ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "QuestionRequestTemplate" ADD CONSTRAINT "QuestionRequestTemplate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
