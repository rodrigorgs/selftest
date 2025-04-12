import prisma from "@/lib/prisma";
import { PrismaJson } from "@/prisma/types";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { getSession } from "next-auth/react";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  try {
    const templates = await prisma.questionRequestTemplate.findMany();
    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, promptTemplate, parameters } = await req.json();
  if (!name || !promptTemplate) {
    return NextResponse.json({ error: "Name and promptTemplate are required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newTemplate = await prisma.questionRequestTemplate.create({
      data: {
        name,
        promptTemplate,
        parameters: parameters as PrismaJson.QuestionRequestTemplateParameter[],
        ownerId: user.id,
      },
    });
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}