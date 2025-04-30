'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/apiUtils";
import prisma from "@/lib/prisma";
import { useSearchParams } from "next/navigation";
import { fetchRequests } from "./server";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

export default function QuestionRequestsPage() {
  const searchParams = useSearchParams();
  const userIdStr = searchParams?.get("userId") || null;
  const userId = userIdStr === null || userIdStr == '' ? undefined : parseInt(userIdStr, 10);
  const [requests, setRequests] = useState<any>([]);

  useEffect(() => {
    async function fetchData() {
      const result = await fetchRequests({ userId });
      setRequests(result);
    }

    fetchData();
  }, []);

  // return <div>Oi</div>;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div>
        <h1>Users</h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Template</TableHead>
              <TableHead className="text-left">Parameters</TableHead>
              <TableHead className="text-left">Correct</TableHead>
              <TableHead className="text-left">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request: any) => (
              <TableRow key={request.id}>
                <TableCell>{request.template?.name}</TableCell>
                <TableCell>{getParameterString(request.parameterValues)}</TableCell>
                <TableCell>
                  {getNumberOfCorrectAnswers(request.questions)}
                </TableCell>
                <TableCell>
                  <Link href={`/questions?questionRequestId=${request.id}&userId=${request.userId}`} className="text-blue-500 hover:underline">
                    View Questions
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Suspense>
  );
}

function getParameterString(parameterValues: any) {
  if (parameterValues.length === 0) {
    return "No parameters";
  }
  return parameterValues.map((param: any) => {
    if (param.values.length > 0) {
      return `${param.name}: ${param.values.join(", ")}`;
    } else {
      return `${param.name}: No values`;
    }
  }).join(", ");
}

function getNumberOfCorrectAnswers(questions: any) {
  if (questions.length === 0) {
    return "No questions";
  }
  return questions.filter((question: any) => {
    if (question.answers.length === 0) {
      return false;
    }
    return question.correctAnswerIndex === question.answers[0].answerIndex;
  }).length;
}
