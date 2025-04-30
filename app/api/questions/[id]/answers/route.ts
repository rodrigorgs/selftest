import { getCurrentUser, getParamId } from "@/lib/apiUtils";
import prisma from "@/lib/prisma";
import { get } from "http";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function getParams(req: Request, params: Promise<{ id: string }>) {
  const questionId = await getParamId({ params });
  const user = await getCurrentUser(req);

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });
  if (!question) {
    throw NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return { user, question };
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, question } = await getParams(req, params)
    // if an answer already exists for this question and user, return error
    const existingAnswer = await prisma.answer.findFirst({
      where: {
        questionId: question.id,
        userId: user.id,
      },
    });

    // get question
    if (existingAnswer) {
      return NextResponse.json({ error: "Answer already exists" }, { status: 400 });
    }

    const { answerIndex, confidenceLevel } = await req.json();
    const answer = await prisma.answer.create({
      data: {
        questionId: question.id,
        userId: user.id,
        answerIndex,
        confidenceLevel,
        correct: answerIndex === question.correctAnswerIndex,
      },
    });

    return NextResponse.json(answer, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return NextResponse.json({ error: "Failed to create answer" }, { status: 500 });
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, question } = await getParams(req, await params);
    // get answer
    const answer = await prisma.answer.findFirst({
      where: {
        questionId: question.id,
        userId: user.id,
      },
    });
    if (!answer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }
    return NextResponse.json(answer, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    return NextResponse.json({ error: "Failed to fetch answer" }, { status: 500 });
  }
}
