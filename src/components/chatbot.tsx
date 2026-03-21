"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { answerTravelQuestion } from "@/lib/api/travel-buddy";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Message = {
  role: "user" | "assistant";
  content: string;
  ctaLabel?: string;
  ctaAction?: () => void;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const isTripPlanningIntent = (text: string) => {
    const normalized = text.toLowerCase();
    return [
      "plan a trip",
      "plan my trip",
      "trip plan",
      "trip planner",
      "travel plan",
      "i want to travel",
      "i want to plan a trip",
    ].some((phrase) => normalized.includes(phrase));
  };

  const buildFallbackAnswer = (question: string) => {
    const normalized = question.toLowerCase();

    if (isTripPlanningIntent(question)) {
      return "I can help with that. Open the AI Trip Planner to generate a day-by-day plan with budget, weather advice, and suitability scoring.";
    }

    if (normalized.includes("route") || normalized.includes("directions")) {
      return "Use the Route Planner to compare car, walking, bike, and bus routes. You can search locations, use your current location, or pick points directly on the map.";
    }

    if (normalized.includes("hotel") || normalized.includes("stay") || normalized.includes("accommodation")) {
      return "You can explore Hotels and Dharamshalas in the Accommodations section. Filter by city to compare practical stay options.";
    }

    if (normalized.includes("cab") || normalized.includes("bus") || normalized.includes("train") || normalized.includes("transport")) {
      return "Open Local Travel Navigator to browse cabs, buses, and trains. It is useful for verified local travel choices inside India.";
    }

    return "I’m in local assistant mode right now. You can ask about trip planning, routes, places to explore, stays, or local transport in India.";
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "div[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    const question = input;
    setInput("");

    try {
      const response = await answerTravelQuestion(question);
      const assistantMessage: Message = {
        role: "assistant",
        content: response.answer,
        ...(isTripPlanningIntent(question)
          ? {
              ctaLabel: "Open AI Trip Planner",
              ctaAction: () => {
                setIsOpen(false);
                navigate("/trip-planner");
              },
            }
          : {}),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error answering question:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: buildFallbackAnswer(question),
        ...(isTripPlanningIntent(question)
          ? {
              ctaLabel: "Open AI Trip Planner",
              ctaAction: () => {
                setIsOpen(false);
                navigate("/trip-planner");
              },
            }
          : {}),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[120]">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            className="rounded-full h-16 w-16 shadow-lg bg-card hover:bg-muted text-primary border-2 border-primary"
          >
            {isOpen ? <X className="h-8 w-8" /> : <Bot className="h-8 w-8" />}
            <span className="sr-only">Open Travel Assistant</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          sideOffset={16}
          align="end"
          collisionPadding={24}
          className="z-[130] w-[min(24rem,calc(100vw-2rem))] p-0 bg-background/95 backdrop-blur-sm shadow-2xl"
        >
          <div className="flex flex-col h-[60vh]">
            <div className="bg-muted/50 p-3 border-b text-center">
              <h3 className="font-semibold font-headline">Travel Assistant</h3>
            </div>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4 pr-4">
                {messages.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground pt-8">
                    <Bot className="mx-auto h-8 w-8 mb-2" />
                    <p className="text-primary">
                      Welcome to Travel Buddy India, your personal guide to
                      exploring India. How can I help you plan your adventure
                      today?
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 text-sm ${
                        message.role === "user" ? "justify-end" : ""
                      }`}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8 border">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`rounded-lg px-3 py-2 max-w-[85%] whitespace-pre-wrap ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div>{message.content}</div>
                        {message.ctaLabel && message.ctaAction && (
                          <Button
                            type="button"
                            size="sm"
                            className="mt-3"
                            onClick={message.ctaAction}
                          >
                            {message.ctaLabel}
                          </Button>
                        )}
                      </div>
                      {message.role === "user" && (
                        <Avatar className="h-8 w-8 border">
                          <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8 border">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-3 py-2 bg-muted flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="border-t p-3 bg-background/80">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask a question..."
                  className="flex-1"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </Button>
              </form>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
