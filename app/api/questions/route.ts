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

  const interesting = searchParams.get("interesting");

  return { userId, templateId, questionRequestId, interesting };
}

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    let { userId, templateId, questionRequestId, interesting } = await getParams(req);
    if (!userId) {
      userId = currentUser.id;
    }

    if (userId != currentUser.id && !currentUser.admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (interesting) {
      userId = -1;
    }

    console.log("userId", userId);
    console.log("interesting", interesting);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const criterion: any = {
      include: {
        answers: true,
      },
      ...(userId === -1 && { take: 50 }),
      where: {
        answers: {
          some: {
            ...(userId !== -1 && { userId: userId }),
            ...(interesting && {
              AND: [
                { correct: false },
                {
                  OR: [
                    { flaggedIncorrect: true },
                    { flaggedProblematic: true },
                    ,
                  ]
                }
              ]
            }),
          },
        },
        request: {
          ...(userId !== -1 && { userId: userId }),
          ...(questionRequestId !== undefined && { id: questionRequestId }),
          ...(templateId !== undefined && { templateId: templateId }),
        },
      },
      orderBy: {
        request: {
          createdAt: "desc",
        },
      },
    };
    console.log("Criterion", criterion);
    const questions = await prisma.question.findMany(criterion);
    return NextResponse.json({ questions });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }
    throw error;
  }
}
