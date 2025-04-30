'use server';

import { getCurrentUser } from "@/lib/apiUtils";
import prisma from "@/lib/prisma";

export async function fetchRequests(params: { userId?: number }) {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    throw new Error("Unauthorized");
  }
  if (!params.userId) {
    params.userId = currentUser.id;
  }
  if (params.userId != currentUser.id && !currentUser.admin) {
    throw new Error("Unauthorized");
  }

  return prisma.questionRequest.findMany({
    where: {  
      userId: params.userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      template: {
        select: {
          id: true,
          name: true,
        },
      },
      questions: {
        select: {
          id: true,
          correctAnswerIndex: true,
          answers: {
            where: {
              userId: params.userId,
            },
            select: {
              id: true,
              answerIndex: true,
              confidenceLevel: true,
              correct: true,
            },
          },
        },
      },
    },
  });
}