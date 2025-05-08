'use client';

import { useEffect, useState } from "react";
import { fetchExcellentAnswers, fetchFlaggedAnswers, fetchSurprisingAnswers } from "./server";
import { QuestionCard } from "@/components/questionCard";

enum InterestingType {
  PROBLEMS = 'problems',
  SURPRISING = 'surprising',
  EXCELLENT = 'excellent',
}

export default function InterestingAnswers() {
  const [type, setType] = useState<InterestingType>(InterestingType.PROBLEMS);
  const [answers, setAnswers] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let result;
    switch (type) {
      case InterestingType.PROBLEMS:
        result = fetchFlaggedAnswers();
        break;
      case InterestingType.SURPRISING:
        result = fetchSurprisingAnswers();
        break;
      case InterestingType.EXCELLENT:
        result = fetchExcellentAnswers();
        break;
    }
    result.then((answers) => {
      setAnswers(answers);
      setLoading(false);
    }).catch((error) => {
      console.error("Error fetching answers:", error);
      setLoading(false);
    }
    );
  }, [type]);
    

  return <div>
    <h1>Interesting Answers</h1>
    <div className="flex space-x-2">
      <button
      onClick={() => setType(InterestingType.PROBLEMS)}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
      Problems
      </button>
      <button
      onClick={() => setType(InterestingType.SURPRISING)}
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
      Surprising
      </button>
      <button
      onClick={() => setType(InterestingType.EXCELLENT)}
      className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
      Excellent
      </button>
    </div>

    <h2>{type === InterestingType.PROBLEMS ? "Flagged Problems" : type === InterestingType.SURPRISING ? "Surprising Answers" : "Excellent Answers"}</h2>

    {loading ? (
      <p>Loading...</p>
    ) : (
      <ul>
        {answers.map((answer: any) => (
          <QuestionCard key={answer.id} question={answer.question} withAnswer={answer} />
          // <li key={answer.id}># {answer.question.content}</li>
        ))}
      </ul>
    )}

  </div>;
}