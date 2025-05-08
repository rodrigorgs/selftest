'use server';

import prisma from "@/lib/prisma";

export async function fetchTemplates() {
  return await prisma.questionRequestTemplate.findMany();
}


export async function fetchTemplate(templateId: number) {
  return await prisma.questionRequestTemplate.findUniqueOrThrow({
    where: {
      id: templateId,
    },
  });
}

export async function fetchUsersWhoUsedTemplate(templateId: number) {
  return await prisma.user.findMany({
    where: {
      questionRequests: {
        some: {
          template: {
            id: templateId
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });
}

export async function fetchRequestsForTemplate(templateId: number) {
  return await prisma.questionRequest.findMany({
    where: {
      templateId: templateId,
    },
    include: {
      questions: {
        include: {
          answers: {
            select: {
              correct: true,
            }
          }
        }
      }
    }
  });
}