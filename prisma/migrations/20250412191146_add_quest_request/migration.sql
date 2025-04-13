/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
ADD COLUMN     "admin" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "QuestionRequest" (
    "id" SERIAL NOT NULL,
    "parameterValues" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "templateId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "QuestionRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuestionRequest" ADD CONSTRAINT "QuestionRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionRequest" ADD CONSTRAINT "QuestionRequest_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "QuestionRequestTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
