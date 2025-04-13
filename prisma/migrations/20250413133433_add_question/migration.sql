-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "correctAnswerIndex" INTEGER NOT NULL,
    "alternatives" JSONB[],
    "requestId" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "QuestionRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
