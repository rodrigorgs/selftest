import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import { QuestionRequest } from "@/app/generated/prisma";
import { PrismaJson } from "@/prisma/types";

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

    const newQuestionRequest = await prisma.questionRequest.create({
      data: {
        parameterValues,
        templateId,
        userId: user.id,
      },
    });

    await generateQuestions(newQuestionRequest);

    return NextResponse.json(newQuestionRequest, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

async function generateQuestions(questionRequest: QuestionRequest) {
  const jsonString = await requestLLM(questionRequest);
  if (!jsonString) {
    throw new Error("No response from LLM");
  }
  // console.log('RESULT', jsonString);
  const json: PrismaJson.MultipleChoiceQuestionResponse = JSON.parse(jsonString);
  const questions = json.questions;

  // for each question, shuffle the alternatives, updating the correctAnswerIndex
  questions.forEach((question) => {
    const indices = Array.from({ length: question.alternatives.length }, (_, i) => i);
    indices.sort((i) => Math.random() - 0.5);
    // shuffle alternatives and update the index of the correct answer
    question.alternatives = indices.map((i) => question.alternatives[i]);
    question.correctAnswerIndex = indices.indexOf(question.correctAnswerIndex);
  });

  await prisma.question.createMany({
    data: questions.map((question) => ({
      content: question.content,
      correctAnswerIndex: question.correctAnswerIndex,
      requestId: questionRequest.id,
      alternatives: question.alternatives.map((alternative) => ({
        content: alternative.content,
        feedback: alternative.feedback,
      })),
    })),
  });
}

async function generatePrompt(questionRequest: QuestionRequest) {
  const template = await prisma.questionRequestTemplate.findUnique({
    where: { id: questionRequest.templateId },
  });
  if (!template) {
    throw new Error("Template not found");
  }

  const promptTemplate = template.promptTemplate;
  const parameterValues = questionRequest.parameterValues;
  const prompt = promptTemplate.replace(/\<(\w+)\>/g, (_, key) => {
    const value = parameterValues.find((param) => param.name === key);
    return value ? value.values[0] : "";
  });
  return prompt;
}

async function requestLLM(questionRequest: QuestionRequest) {
  const prompt = await generatePrompt(questionRequest);
  
  console.log(prompt);

  const openai = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
  });

  console.log('sending request to LLM');
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: prompt }],
    model: 'deepseek-chat',
    response_format: {
      type: 'json_object'
    }
  });

  return completion.choices[0].message.content;
}