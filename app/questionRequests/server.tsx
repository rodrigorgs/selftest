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
      ...(params.userId !== -1 && { userId: params.userId }),
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: params.userId === -1 ? 50 : undefined,
    include: {
      template: {
        select: {
          id: true,
          name: true,
        },
      },
      user: {
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
            ...(params.userId !== -1 && {
              where: {
                userId: params.userId,
              }
            }),
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