import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  try {
    const requests = await prisma.questionRequest.findMany();
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { templateId, parameterValues } = await req.json();
  if (!templateId || !parameterValues) {
    return NextResponse.json({ error: "templateId and parameterValues are required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newTemplate = await prisma.questionRequest.create({
      data: {
        parameterValues,
        templateId,
        userId: user.id,
      },
    });
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}