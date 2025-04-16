import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const numericId = parseInt(id, 10);
  
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }
  
    try {
      await prisma.questionRequestTemplate.delete({
        where: { id: numericId },
      });
      return NextResponse.json({ message: "Template deleted successfully" }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
    }
  }