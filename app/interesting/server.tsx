'use server';

import { getCurrentUser } from "@/lib/apiUtils";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const user = await getCurrentUser();
  console.log('XXX user', user);
  if (!user || !user.admin) {
    throw new Error("Unauthorized");
  }
}

export async function fetchSurprisingAnswers(templateId?: number) {
  await requireAdmin();

  return await prisma.answer.findMany({
    where: {
      correct: false,
      confidenceLevel: {
        gte: 4,
      },
    },
    include: {
      question: {
        ...(templateId && {
          where: {
            request: {
              templateId: templateId,
            },
          },
        }),
        include: {
          request: true,
        },
      },
    },
  });
}

export async function fetchFlaggedAnswers() {
  await requireAdmin();

  return await prisma.answer.findMany({
    where: {
      OR: [
        { flaggedIncorrect: true },
        { flaggedProblematic: true },
      ]
    },
    include: {
      question: {
        include: {
          request: true,
        },
      },
    },
  });
}

export async function fetchExcellentAnswers() {
  await requireAdmin();

  return await prisma.answer.findMany({
    where: {
      flaggedExcellent: true,
    },
    include: {
      question: {
        include: {
          request: true,
        },
      },
    },
  });
}