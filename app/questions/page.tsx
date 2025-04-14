'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Answer, Question } from "../generated/prisma";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@radix-ui/react-label";
import { Button } from "@/components/ui/button";
import { unstable_batchedUpdates } from "react-dom";

export default function QuestionsPage() {
  // const router = useRouter();
  const searchParams = useSearchParams();
  const [questions, setQuestions] = useState<any[]>([]);

  // Fetch questions from the server
  async function fetchQuestions(templateId: string) {
    const response = await fetch(`/api/questions?templateId=${templateId}`);
    const data = await response.json();
    setQuestions(data.questions);
  }

  useEffect(() => {
    const templateId = searchParams?.get("templateId");
    if (templateId) {
      fetchQuestions(templateId);
    }
  }, [useSearchParams]);

  // Use shadcn card
  return (
    <Card className="w-full">
      <CardHeader>
        <h1 className="text-2xl font-bold">Questions</h1>
      </CardHeader>
      <CardContent>
        {questions.length > 0 ? (
          questions.map((question: any) => (
            // console.log('QUESTION ', question),
            <div key={question.id} className="mb-4">
              <QuestionCard question={question} />
            </div>
          ))
        ) : (
          <p className="text-gray-500">No questions available.</p>
        )}
      </CardContent>
    </Card>
  )
}

function QuestionCard(props: { question: Question }) {
  const { question } = props;
  const [alternative, setAlternative] = useState<number | null>(null);
  const [confidenceLevel, setConfidenceLevel] = useState<number | null>(null);
  const [answer, setAnswer] = useState<Answer | null>(null);

  useEffect(() => {
    const fetchAnswer = async () => {
      const response = await fetch(`/api/questions/${question.id}/answers`);
      if (response.status === 404) {
        return;
      }
      const answer = await response.json();
      setAnswer(answer);
    };

    fetchAnswer();
  }, []);

  useEffect(() => {
    if (answer) {
      unstable_batchedUpdates(() => {
        setAlternative(answer.answerIndex);
        setConfidenceLevel(answer.confidenceLevel);
      });
    }
  }, [answer]);

  async function submitAnswer() {
    if (alternative === null || confidenceLevel === null) return;

    try {
      const response = await fetch(`/api/questions/${question.id}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answerIndex: alternative, confidenceLevel }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }

      const data = await response.json();
      setAnswer(data);
      console.log("Answer submitted successfully", data);
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  }

  function getAnswerClassName(alternativeIdx: number) {
    if (answer === null) return '';
    if (alternativeIdx === question.correctAnswerIndex) {
      return 'text-green-700';
    } else {
      return 'text-red-700';
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <h1 className="text-2xl font-bold">Question</h1>
        {answer && (
          <div>
            {/* <p className="text-gray-500">You have already answered this question.</p> */}
            <p className={getAnswerClassName(answer.answerIndex)}>Your answer is {answer.correct ? 'correct' : 'incorrect'}!</p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">{question.content}</p>
        <br />
        {/* one item for each alternative */}
        <RadioGroup
          disabled={answer !== null}
          className="flex flex-col space-y-2"
          value={alternative !== null ? '' + alternative : undefined}
          onValueChange={(value: string) => setAlternative(parseInt(value))}
        >
          {question.alternatives.map((alternative: any, alternativeIdx: number) => (
            <div className="flex flex-col space-y-1" key={alternativeIdx}>
              <div className="flex items-center space-x-2">
              <RadioGroupItem id={`question-${question.id}-${alternativeIdx}`} value={'' + alternativeIdx} />
              <Label htmlFor={`question-${question.id}-${alternativeIdx}`} className="ml-2">
                {answer && (alternativeIdx === question.correctAnswerIndex
                ? <span className={getAnswerClassName(alternativeIdx)}>✓ </span>
                : <span className={getAnswerClassName(alternativeIdx)}>✗ </span>)}
                {alternative.content}
              </Label>
              </div>
              {answer && (
              <p className={getAnswerClassName(alternativeIdx)}>{question.alternatives[alternativeIdx].feedback}</p>
              )}
            </div>
          ))}
        </RadioGroup>
        {/* Confidence level */}
        {answer === null && (
          <div>
            <br/>
            <p>Nível de confiança de que acertou a resposta (1 = pouco confiante, 5 = muito confiante)</p>
            <br />
            <RadioGroup
              disabled={answer !== null}
              className="flex flex-row space-x-1"
              value={confidenceLevel !== null ? '' + confidenceLevel : undefined}
              onValueChange={(value: string) => setConfidenceLevel(parseInt(value))}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <span className="flex items-left space-x-1" key={value}>
                  <RadioGroupItem value={value.toString()} id={`question-${question.id}-r${value}`} />
                  <Label htmlFor={`question-${question.id}-r${value}`} className="ml-1">{value}</Label>
                </span>
              ))}
            </RadioGroup>
            <br />
            <Button
              variant="default"
              disabled={alternative === null || confidenceLevel === null}
              onClick={() => submitAnswer()}
            >
              {/* get response to update self */}
              Submit
            </Button>
          </div>)}
      </CardContent>
    </Card>
  )
}