import { getCurrentUser, getParamId } from "@/lib/apiUtils";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = await getParamId({ params });
  const user = await getCurrentUser();
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