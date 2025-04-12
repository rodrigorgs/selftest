import prisma from "@/lib/prisma";
import { PrismaJson } from "@/prisma/types";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const templates = await prisma.questionRequestTemplate.findMany();
      res.status(200).json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  } else if (req.method === "POST") {
    const { name, promptTemplate, parameters } = req.body;
    if (!name || !promptTemplate) {
      return res.status(400).json({ error: "Name and promptTemplate are required" });
    }
    try {
      const newTemplate = await prisma.questionRequestTemplate.create({
        data: {
          name,
          promptTemplate,
          parameters: parameters as PrismaJson.QuestionRequestTemplateParameter[],
        },
      });
      res.status(201).json(newTemplate);
    } catch (error) {
      res.status(500).json({ error: "Failed to create template" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}