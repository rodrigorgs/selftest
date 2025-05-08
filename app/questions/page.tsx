'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import { Marked } from "marked";
import { Suspense } from "react";
import 'highlight.js/styles/github.css';
import { QuestionCard } from "@/components/questionCard";

const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang, info) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);
function QuestionsPageInner() {
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<any[]>([]);

  // Fetch questions from the server
  async function fetchQuestions(params: { templateId?: string, userId?: string, questionRequestId?: string }) {
    const { templateId, userId, questionRequestId } = params;

    const fetchSearchParams = new URLSearchParams();

    if (templateId) {
      fetchSearchParams.set('templateId', templateId);
    }
    if (userId) {
      fetchSearchParams.set('userId', userId);
    }
    if (questionRequestId) {
      fetchSearchParams.set('questionRequestId', questionRequestId);
    }

    const url = `/api/questions?${fetchSearchParams.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    setQuestions(data.questions);
  }

  useEffect(() => {
    const templateId = searchParams?.get("templateId") || undefined;
    const userId = searchParams?.get("userId") || undefined;
    const questionRequestId = searchParams?.get("questionRequestId") || undefined;
    fetchQuestions({ templateId, userId, questionRequestId });
  }, [searchParams]);

  const userIdStr = searchParams?.get('userId');
  const userId = userIdStr == undefined ? undefined : parseInt(userIdStr, 10);

  return <Card className="w-full">
    <CardHeader>
      <h1 className="text-2xl font-bold">Questions</h1>
    </CardHeader>
    <CardContent>
      {questions.length > 0 ? (
        questions.map((question: any) => (
          <div key={question.id} className="mb-4">
            <QuestionCard question={question} userId={userId} />
          </div>
        ))
      ) : (
        <p className="text-gray-500">No questions available.</p>
      )}
    </CardContent>
  </Card>
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <QuestionsPageInner />
    </Suspense>
  );
}
