"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle, MessageSquare } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Quiz types
interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

interface InteractionsSidebarProps {
  quiz?: Quiz;
}

export default function InteractionsSidebar({
  quiz,
}: InteractionsSidebarProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    quiz?.questions?.map(() => -1) || []
  );
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handle option selection
  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;

    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = optionIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  // Handle quiz submission
  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  // Check if an answer is correct
  const isCorrect = (questionIndex: number, optionIndex: number) => {
    if (!quiz) return false;
    return quiz.questions[questionIndex].correctAnswer === optionIndex;
  };

  // Calculate score
  const score =
    isSubmitted && quiz
      ? selectedAnswers.reduce(
          (acc, answer, index) => acc + (isCorrect(index, answer) ? 1 : 0),
          0
        )
      : 0;

  // Dummy chat messages
  const dummyChatMessages = [
    {
      id: 1,
      text: "Hi! How can I help you understand this material better?",
      isUser: false,
    },
    {
      id: 2,
      text: "I'm having trouble understanding the concept of state management.",
      isUser: true,
    },
    {
      id: 3,
      text: "State management refers to how data is stored, updated, and shared between components in your application. Would you like me to explain more about specific state management approaches?",
      isUser: false,
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <Tabs defaultValue="quiz">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="quiz" className="flex-1 cursor-pointer">
            Knowledge Check
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex-1 cursor-pointer">
            AI Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quiz">
          {!quiz ? (
            <div>
              <h2 className="font-semibold text-lg mb-4">Knowledge Check</h2>
              <p className="text-muted-foreground text-sm">
                No quiz available for this chapter.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-semibold text-lg mb-4">{quiz.title}</h2>

              <div className="space-y-5 md:space-y-6">
                {quiz.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="space-y-3">
                    <p className="font-medium text-sm md:text-base">
                      {question.question}
                    </p>

                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => {
                        const isSelected =
                          selectedAnswers[questionIndex] === optionIndex;
                        const correct = isCorrect(questionIndex, optionIndex);
                        const selectedButWrong =
                          isSubmitted && isSelected && !correct;
                        const selectedAndCorrect =
                          isSubmitted && isSelected && correct;
                        const unselectedButCorrect =
                          isSubmitted && !isSelected && correct;

                        return (
                          <div
                            key={optionIndex}
                            className={`
                              flex items-center gap-2 p-2 md:p-3 rounded-md cursor-pointer text-xs md:text-sm
                              ${
                                isSelected && !isSubmitted
                                  ? "bg-primary/10 border border-primary/30"
                                  : ""
                              }
                              ${
                                selectedButWrong
                                  ? "bg-destructive/10 border border-destructive/30 text-destructive"
                                  : ""
                              }
                              ${
                                selectedAndCorrect
                                  ? "bg-success/10 border border-success/30 text-success"
                                  : ""
                              }
                              ${
                                unselectedButCorrect
                                  ? "bg-success/10 border border-success/30 text-success"
                                  : ""
                              }
                              ${!isSubmitted ? "hover:bg-muted" : ""}
                              ${
                                !isSelected && !unselectedButCorrect
                                  ? "border border-border"
                                  : ""
                              }
                            `}
                            onClick={() =>
                              handleSelectOption(questionIndex, optionIndex)
                            }
                          >
                            <div
                              className={`
                              flex-shrink-0 h-3.5 w-3.5 md:h-4 md:w-4 rounded-full border flex items-center justify-center
                              ${
                                isSelected && !isSubmitted
                                  ? "border-primary bg-primary"
                                  : ""
                              }
                              ${
                                selectedButWrong
                                  ? "border-destructive bg-destructive"
                                  : ""
                              }
                              ${
                                selectedAndCorrect
                                  ? "border-success bg-success"
                                  : ""
                              }
                              ${unselectedButCorrect ? "border-success" : ""}
                              ${
                                !isSelected && !unselectedButCorrect
                                  ? "border-input"
                                  : ""
                              }
                            `}
                            >
                              {(selectedAndCorrect || unselectedButCorrect) && (
                                <Check className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                              )}
                              {selectedButWrong && (
                                <AlertCircle className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                              )}
                            </div>
                            <span>{option}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {isSubmitted ? (
                <div className="mt-5 md:mt-6 p-3 md:p-4 bg-background rounded-md border text-center">
                  <p className="font-medium text-sm md:text-base">
                    You scored {score} out of {quiz.questions.length}
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="w-full mt-5 md:mt-6 text-sm"
                  disabled={selectedAnswers.includes(-1)}
                >
                  Submit
                </Button>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="chat">
          <div className="h-[calc(100vh-180px)] flex flex-col">
            <h2 className="font-semibold text-lg mb-4">AI Assistant</h2>

            <div className="flex-1 overflow-y-auto mb-4 space-y-4">
              {dummyChatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask a question about this chapter..."
                className="flex-1 p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <Button size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
