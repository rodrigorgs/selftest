export namespace PrismaJson {
  export type QuestionRequestTemplateParameter = {
    name: string;
    values: string[];
    multipleSelect: boolean;
  };

  export type QuestionRequestParameterValue = {
    name: string;
    values: string[];
  };

  export type MultipleChoiceQuestionResponse = {
    questions: MultipleChoiceQuestion[];
  }

  export type MultipleChoiceQuestion = {
    content: string;
    correctAnswerIndex: number;
    alternatives: MultipleChoiceQuestionAlternative[];
  }

  export type MultipleChoiceQuestionAlternative = {
    content: string;
    feedback: string;
  };

  export type QuestionFeedback = {
    flaggedIncorrect: boolean;
    flaggedProblematic: boolean;
    flaggedExcellent: boolean;
    observation: string;
  }

}
