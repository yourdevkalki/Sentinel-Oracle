"use client";

import { useState } from "react";
import { Bot, Send, Loader2 } from "lucide-react";
import { sendChatMessage } from "../lib/api";

export default function AgentChat({ agentStatus }) {
  const [messages, setMessages] = useState([
    {
      role: "agent",
      content:
        "👋 Hello! I'm Sentinel AI, your oracle guardian. Ask me about the current market status or any anomalies!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await sendChatMessage(input);
      const agentMessage = {
        role: "agent",
        content: response.response,
        timestamp: response.timestamp,
      };
      setMessages((prev) => [...prev, agentMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "❌ Sorry, I encountered an error. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "How is BTC doing?",
    "Is my position safe?",
    "Why did you flag an anomaly?",
  ];

  return (
    <div className="glassmorphism border border-primary/30  overflow-hidden shadow-2xl h-[600px] flex flex-col glow-border-hover transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r  p-5 border-b border-primary/30">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2.5 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg font-display">
              Sentinel AI
            </h3>
            <div className="flex items-center space-x-2 text-xs text-white/90">
              <div
                className={`w-2 h-2 rounded-full live-pulse ${
                  agentStatus?.status === "running"
                    ? "bg-accent-green"
                    : "bg-red-400"
                }`}
              ></div>
              <span className="font-semibold">
                {agentStatus?.status === "running" ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-3 ${
                msg.role === "user"
                  ? "bg-primary text-[#0A0A0A]"
                  : "bg-background-dark/50 border border-primary/20 text-[#F0F0F0]"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </p>
              <p
                className={`text-xs mt-1.5 ${
                  msg.role === "user"
                    ? "text-[#0A0A0A]/70"
                    : "text-[#F0F0F0]/60"
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-background-dark/50 border border-primary/20 rounded-xl p-3">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      <div className="px-4 py-3 border-t border-primary/20 bg-background-dark/30">
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(q);
                setTimeout(handleSend, 100);
              }}
              className="text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-3 py-1.5 rounded-lg transition-all hover:scale-105 font-medium"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-primary/20 bg-background-dark/30">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={sending}
            className="flex-1 bg-background-dark border-2 border-primary/30 text-white placeholder-[#F0F0F0]/40 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,225,255,0.2)] disabled:opacity-50 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="bg-primary hover:bg-opacity-90 disabled:bg-primary/20 disabled:cursor-not-allowed text-[#0A0A0A] p-3 rounded-lg transition-all shadow-[0_0_15px_rgba(0,225,255,0.4)] hover:shadow-[0_0_25px_rgba(0,225,255,0.6)] hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
