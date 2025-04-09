"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle, MessageSquare, RotateCcw, Eye, Send } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { generateChatResponse } from "../actions";

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

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
}

interface InteractionsSidebarProps {
  quiz?: Quiz;
  courseId: string;
  unitId: string;
  chapterId: string;
}

export default function InteractionsSidebar({
  quiz,
  courseId,
  unitId,
  chapterId,
}: InteractionsSidebarProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(
    quiz?.questions?.map(() => -1) || []
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Hi! I'm your AI tutor. How can I help you understand this chapter better?",
      isUser: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset state when quiz changes
  useEffect(() => {
    setSelectedAnswers(quiz?.questions?.map(() => -1) || []);
    setIsSubmitted(false);
    setShowAnswers(false);
  }, [quiz]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);

    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: userMessage, isUser: true },
    ]);

    try {
      // Get AI response
      const result = await generateChatResponse(
        courseId,
        unitId,
        chapterId,
        userMessage
      );

      if (result.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: result.response || "I'm sorry, I couldn't generate a response. Please try again.",
            isUser: false,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: "Sorry, I encountered an error. Please try again.",
            isUser: false,
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I encountered an error. Please try again.",
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Handle quiz retry
  const handleRetry = () => {
    setSelectedAnswers(quiz?.questions?.map(() => -1) || []);
    setIsSubmitted(false);
    setShowAnswers(false);
  };

  // Handle show/hide answers
  const handleShowAnswers = () => {
    setShowAnswers(!showAnswers);
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
                        const showAsCorrect = showAnswers && correct;

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
                                  ? "bg-green-100 border border-green-300 text-green-700"
                                  : ""
                              }
                              ${
                                showAsCorrect && !isSelected
                                  ? "bg-green-100 border border-green-300 text-green-700"
                                  : ""
                              }
                              ${!isSubmitted ? "hover:bg-muted" : ""}
                              ${
                                !isSelected && !selectedAndCorrect && !showAsCorrect
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
                                  ? "border-green-500 bg-green-500"
                                  : ""
                              }
                              ${
                                showAsCorrect && !isSelected
                                  ? "border-green-500 bg-green-500"
                                  : ""
                              }
                              ${
                                !isSelected && !selectedAndCorrect && !showAsCorrect
                                  ? "border-input"
                                  : ""
                              }
                            `}
                            >
                              {(selectedAndCorrect || (showAsCorrect && !isSelected)) && (
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
                <div className="mt-5 md:mt-6 space-y-3">
                  <div className="p-3 md:p-4 bg-background rounded-md border text-center">
                    <p className="font-medium text-sm md:text-base">
                      You scored {score} out of {quiz.questions.length}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      className="flex-1"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Retry Quiz
                    </Button>
                    <Button
                      onClick={handleShowAnswers}
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showAnswers ? "Hide Answers" : "Show Answers"}
                    </Button>
                  </div>
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
              {messages.map((message) => (
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
              <div ref={messagesEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask a question about this chapter..."
                className="flex-1 p-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                disabled={isLoading}
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
