import { getCurrentUser } from "@/lib/apiUtils";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function getParams(req: Request) {
  const { searchParams } = new URL(req.url);
  const templateIdStr = searchParams.get("templateId");
  const templateId = templateIdStr === null || templateIdStr == '' ? undefined : parseInt(templateIdStr, 10);
  
  const userIdStr = searchParams.get("userId");
  const userId = userIdStr === null || userIdStr == '' ? undefined : parseInt(userIdStr, 10);

  const questionRequestIdStr = searchParams.get("questionRequestId");
  const questionRequestId = questionRequestIdStr === null || questionRequestIdStr == '' ? undefined : parseInt(questionRequestIdStr, 10);

  return { userId, templateId, questionRequestId };
}

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    let { userId, templateId, questionRequestId } = await getParams(req);
    if (!userId) {
      userId = currentUser.id;
    }

    if (userId != currentUser.id && !currentUser.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const questions = await prisma.question.findMany({
      include: {
      answers: true,
      },
      where: {
      answers: {
        every: {
        userId: userId,
        },
      },
      request: {
        userId: userId,
        ...(questionRequestId !== undefined && { id: questionRequestId }),
        ...(templateId !== undefined && { templateId: templateId }),
      },
      },
      orderBy: {
      request: {
        createdAt: "desc",
      },
      },
    });
    return NextResponse.json({ questions });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    throw error;
  }
}
