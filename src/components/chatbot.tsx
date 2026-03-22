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

  const isPlaceSearchIntent = (text: string) => {
    const normalized = text.toLowerCase();
    return [
      "search places",
      "find places",
      "explore places",
      "search cafe",
      "search cafes",
      "find cafe",
      "find restaurant",
      "search restaurants",
      "tourist places",
      "places to visit",
      "want search places",
      "i want search places",
      "i want to search places",
    ].some((phrase) => normalized.includes(phrase));
  };

  const isRouteIntent = (text: string) => {
    const normalized = text.toLowerCase();
    return normalized.includes("route") || normalized.includes("directions");
  };

  const isStayIntent = (text: string) => {
    const normalized = text.toLowerCase();
    return (
      normalized.includes("hotel") ||
      normalized.includes("stay") ||
      normalized.includes("accommodation")
    );
  };

  const isTransportIntent = (text: string) => {
    const normalized = text.toLowerCase();
    return (
      normalized.includes("cab") ||
      normalized.includes("bus") ||
      normalized.includes("train") ||
      normalized.includes("transport")
    );
  };

  const isGreetingIntent = (text: string) => {
    const normalized = text.trim().toLowerCase();
    return [
      "hi",
      "hii",
      "hello",
      "hey",
      "hlw",
      "namaste",
      "ram ram",
      "ram ram ji",
      "good morning",
      "good evening",
    ].includes(normalized);
  };

  const withGreeting = (content: string) => {
    if (messages.some((message) => message.role === "assistant")) {
      return content;
    }

    return `Namaste! Ram Ram ji. I am your Travel Buddy assistant. What can I help you with today?\n\n${content}`;
  };

  const buildFallbackAnswer = (question: string) => {
    const normalized = question.toLowerCase();

    if (isGreetingIntent(question)) {
      return "Namaste! Ram Ram ji. I can help with trip planning, routes, hotels, local transport, and places to explore in India.";
    }

    if (isTripPlanningIntent(question)) {
      return "I can help with that. Open the AI Trip Planner to generate a day-by-day plan with hotel, meal, sightseeing, and budget details.";
    }

    if (isPlaceSearchIntent(question)) {
      return "You can open Smart Place Finder to look for cafes, temples, food spots, attractions, and useful nearby places in Indian cities.";
    }

    if (isRouteIntent(question)) {
      return "Use the Route Planner to compare car, walking, bike, and bus routes. You can search locations, use your current location, or pick points directly on the map.";
    }

    if (isStayIntent(question)) {
      return "You can explore Hotels and Dharamshalas in the Accommodations section. Filter by city to compare practical stay options.";
    }

    if (isTransportIntent(question)) {
      return "Open Local Travel Navigator to browse cabs, buses, and trains. It is useful for verified local travel choices inside India.";
    }

    return "I'm in local assistant mode right now. You can ask about trip planning, routes, places to explore, stays, or local transport in India.";
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
      if (isGreetingIntent(question)) {
        const assistantMessage: Message = {
          role: "assistant",
          content: withGreeting(
            "I can help you plan a trip, find a route, check stays, compare local transport, or suggest places to visit."
          ),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        return;
      }

      if (isTripPlanningIntent(question)) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: withGreeting(
              "I can help with that. Open the AI Trip Planner to generate a day-by-day plan with hotel, meal, sightseeing, and budget details."
            ),
            ctaLabel: "Open AI Trip Planner",
            ctaAction: () => {
              setIsOpen(false);
              navigate("/trip-planner");
            },
          },
        ]);
        return;
      }

      if (isPlaceSearchIntent(question)) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: withGreeting(
              "Sure. Open Smart Place Finder to search cafes, temples, attractions, breakfast spots, and practical nearby places in your selected city."
            ),
            ctaLabel: "Open Smart Place Finder",
            ctaAction: () => {
              setIsOpen(false);
              navigate("/explore");
            },
          },
        ]);
        return;
      }

      if (isRouteIntent(question)) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: withGreeting(
              "Open Route Planner to compare car, walking, bike, and bus routes. You can search places, use your current location, or pick points directly on the map."
            ),
            ctaLabel: "Open Route Planner",
            ctaAction: () => {
              setIsOpen(false);
              navigate("/route-planner");
            },
          },
        ]);
        return;
      }

      if (isStayIntent(question)) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: withGreeting(
              "Open Accommodations to compare hotels and Dharamshalas by city, budget, and trip style."
            ),
            ctaLabel: "Open Accommodations",
            ctaAction: () => {
              setIsOpen(false);
              navigate("/accommodations");
            },
          },
        ]);
        return;
      }

      if (isTransportIntent(question)) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: withGreeting(
              "Open Local Travel Navigator to compare cabs, buses, and trains for practical movement during the trip."
            ),
            ctaLabel: "Open Local Travel Navigator",
            ctaAction: () => {
              setIsOpen(false);
              navigate("/local-transport");
            },
          },
        ]);
        return;
      }

      const response = await answerTravelQuestion(question);
      const assistantMessage: Message = {
        role: "assistant",
        content: withGreeting(response.answer),
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
        content: withGreeting(buildFallbackAnswer(question)),
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
    <div className="fixed bottom-6 right-6 z-[1000]">
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
          className="z-[1010] w-[min(24rem,calc(100vw-2rem))] p-0 bg-background/95 backdrop-blur-sm shadow-2xl"
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
                      Namaste! Ram Ram ji. Welcome to Travel Buddy India. How can I help you with your travel plan today?
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
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
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
