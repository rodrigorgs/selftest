import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function getParams(req: Request) {
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    throw NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const templateIdStr = searchParams.get("templateId");
  const templateId = templateIdStr === null || templateIdStr == '' ? undefined : parseInt(templateIdStr, 10);

  return { user, templateId };
}

export async function GET(req: Request) {
  try {
    const { user, templateId } = await getParams(req);

    const questions = await prisma.question.findMany({
      include: {
      answers: true,
      },
      where: {
      answers: {
        every: {
        userId: user.id,
        },
      },
      request: {
        userId: user.id,
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
