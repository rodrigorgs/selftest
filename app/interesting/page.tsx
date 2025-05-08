'use client';

import { useEffect, useState } from "react";
import { fetchExcellentAnswers, fetchFlaggedAnswers, fetchSurprisingAnswers } from "./server";
import { QuestionCard } from "../questions/page";

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
    <div>
      <button onClick={() => setType(InterestingType.PROBLEMS)}>Problems</button>
      <button onClick={() => setType(InterestingType.SURPRISING)}>Surprising</button>
      <button onClick={() => setType(InterestingType.EXCELLENT)}>Excellent</button>
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