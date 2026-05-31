"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Send,
  Sparkles,
  User,
  Compass,
  ArrowRight,
  Plane,
  Plus,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: {
    type: string;
    label: string;
    href: string;
  }[];
}

const suggestedPrompts = [
  "Plan a 5-day trip to Rome under $2000",
  "Suggest budget hotels in Tokyo, Japan",
  "What visa requirements are needed for Paris?",
  "What is the safety rating for Paris, France?",
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      {
        id: "msg-welcome",
        role: "assistant",
        content: "Hello! I am your TravelEngine AI Assistant. ✈️\n\nI can help you plan custom day-by-day itineraries, check visa requirements, analyze budgets, or re-route schedules. Ask me anything!",
      },
    ]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setTyping(true);

    // Dynamic mock streaming generator
    setTimeout(() => {
      let reply = "";
      let actions: any[] = [];

      const query = textToSend.toLowerCase();
      if (query.includes("rome") || query.includes("italy")) {
        reply = "Mamma mia! Rome is an excellent choice. 🇮🇹\n\nI have generated a draft 5-day itinerary in your dashboard tailored for sightseeing and historical attractions. It stays within your $2000 budget by utilizing charming B&Bs and local trattorias.";
        actions = [{ type: "LINK", label: "View Rome Draft Itinerary", href: "/dashboard/trips/new" }];
      } else if (query.includes("tokyo") || query.includes("japan")) {
        reply = "Konnichiwa! Tokyo is highly recommended. 🇯🇵\n\nFor budget-conscious travelers, I suggest staying in Asakusa or Ueno. Key budget hotels include Toyoko Inn or Dormy Inn, which offer free breakfast and standard amenities under $80/night.";
      } else if (query.includes("visa")) {
        reply = "For US, EU, and UK passport holders:\n\n• **Japan**: Visa-waiver waiver eVisa registry for up to 90 days. Register on Visit Japan Web before boarding.\n• **Schengen (Europe)**: Visa-free entry for up to 90 days. Keep in mind ETIAS registry is mandatory starting in 2026.";
      } else {
        reply = `Certainly! I'd be happy to assist you with travel plans regarding "${textToSend}". Let's refine your trip details, or you can start our structured AI Trip Wizard to get an immediate custom day-by-day schedule.`;
        actions = [{ type: "LINK", label: "Start AI Trip Wizard", href: "/dashboard/trips/new" }];
      }

      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: reply,
          actions,
        },
      ]);
      toast.success("AI response received!");
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in flex flex-col h-[82vh]">
      {/* Header */}
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-indigo-600 animate-pulse" />
          AI Travel Assistant
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Chat with our context-aware agent to explore destinations, build itineraries, and adapt schedules.
        </p>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Suggested Prompts Side Card (1 Column) */}
        <div className="hidden lg:block lg:col-span-1 space-y-4">
          <Card className="border-slate-200/60 shadow-sm bg-white/70 backdrop-blur-sm rounded-2xl p-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1">
              <Compass className="w-4 h-4 text-blue-500 animate-spin-slow" />
              Suggested Commands
            </h2>
            <div className="space-y-2">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="w-full text-left p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl text-slate-600 text-xs font-semibold hover:text-slate-900 transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat Area (3 Columns) */}
        <div className="lg:col-span-3 flex flex-col h-full bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-xl">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-[85%] ${
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                }`}
              >
                {/* Avatar */}
                <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-600"
                    : "bg-gradient-to-br from-indigo-600 to-violet-600"
                }`}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-3">
                  <div className={`p-4 text-xs font-semibold leading-relaxed ${
                    msg.role === "user"
                      ? "chat-bubble-user"
                      : "chat-bubble-ai"
                  }`}>
                    {msg.content.split("\n").map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
                    ))}
                  </div>

                  {/* Actions */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {msg.actions.map((act, i) => (
                        <Link
                          key={i}
                          href={act.href}
                          className="inline-flex items-center justify-center rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white text-[10px] uppercase tracking-wider h-8 px-3 shadow-sm cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-transform"
                        >
                          {act.label}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {typing && (
              <div className="flex gap-3.5 max-w-[85%]">
                <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="chat-bubble-ai p-4 flex items-center gap-1.5 h-[48px]">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask assistant to plan a trip, re-route daily logs, or check visa requirements..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="h-11 border-slate-200 focus:border-blue-500 rounded-xl bg-white"
                disabled={typing}
              />
              <Button
                type="submit"
                size="icon"
                className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 cursor-pointer flex-shrink-0"
                disabled={typing}
              >
                <Send className="w-4.5 h-4.5" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
