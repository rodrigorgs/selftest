import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

async function getParams(req: Request, params: { id: string }) {
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const idString = (await params).id;
  if (!idString) {
    throw NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const id = parseInt(idString, 10);
  if (isNaN(id)) {
    throw NextResponse.json({ error: "id must be a number" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    throw NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return { id, user };
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id, user } = await getParams(req, await params);
  // const { id: idString } = await params;
  // const id = parseInt(idString, 10);
  const json = await req.json();

  try {
    const updatedAnswer = await prisma.answer.update({
      where: { 
        id,
        userId: user.id,
       },
      data: { flaggedExcellent: json.flaggedExcellent,
        flaggedIncorrect: json.flaggedIncorrect,
        flaggedProblematic: json.flaggedProblematic,
        observation: json.observation,},
    });

    return NextResponse.json(updatedAnswer, { status: 200 });
  } catch (error) {
    console.error("Error updating answer feedback:", error);
    return NextResponse.json({ error: "Failed to update answer feedback" }, { status: 500 });
  }
}