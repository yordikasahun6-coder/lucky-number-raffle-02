"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { matchQuestion, KnowledgeData } from "@/lib/helpKnowledgeBase";
import { Icon } from "@iconify/react";
import { X } from "lucide-react";

type Message = { role: "bot" | "user"; text: string };

const SUGGESTIONS = [
  "How much is a ticket?",
  "How do I buy?",
  "When is the draw?",
  "Is this legit?",
];

export default function HelpWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [shining, setShining] = useState(false);
  const [pos, setPos] = useState({ x: 24, y: 24 }); // distance from bottom-right
  const [dragging, setDragging] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi! 👋 I'm your Lucky Ticket assistant. Ask me anything about buying tickets, prizes, or the draw.",
    },
  ]);
  const [input, setInput] = useState("");
  const [knowledge, setKnowledge] = useState<KnowledgeData | null>(null);
  const dragStart = useRef<{
    x: number;
    y: number;
    posX: number;
    posY: number;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("help_widget_pos");
    if (saved) setPos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    fetch("/api/assistant/knowledge")
      .then((res) => res.json())
      .then(setKnowledge)
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (open) return;
    const interval = setInterval(() => {
      setShining(true);
      setTimeout(() => setShining(false), 1200);
    }, 8000); // shines every 8 seconds while closed
    return () => clearInterval(interval);
  }, [open]);
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  if (pathname?.startsWith("/admin")) return null;

  function startDrag(clientX: number, clientY: number) {
    dragStart.current = { x: clientX, y: clientY, posX: pos.x, posY: pos.y };
    setDragging(true);
  }

  function moveDrag(clientX: number, clientY: number) {
    if (!dragStart.current) return;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    const newX = Math.max(8, dragStart.current.posX - dx);
    const newY = Math.max(8, dragStart.current.posY - dy);
    setPos({ x: newX, y: newY });
  }

  function endDrag() {
    if (dragging) {
      localStorage.setItem("help_widget_pos", JSON.stringify(pos));
    }
    setDragging(false);
    dragStart.current = null;
  }

  function handleAsk(question: string) {
    if (!question.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");

    setTimeout(() => {
      const match = matchQuestion(question);
      const answer =
        match && knowledge
          ? match.getAnswer(knowledge)
          : "I'm not totally sure about that one — try asking about ticket price, how to buy, payment methods, the draw date, prizes, or checking your status. For anything else, reach out to us directly on Telegram.";
      setMessages((prev) => [...prev, { role: "bot", text: answer }]);
    }, 400);
  }

  return (
    <>
      <div
        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
        onMouseMove={(e) => dragging && moveDrag(e.clientX, e.clientY)}
        onMouseUp={endDrag}
        onMouseLeave={() => dragging && endDrag()}
        onTouchStart={(e) =>
          startDrag(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchMove={(e) =>
          dragging && moveDrag(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchEnd={endDrag}
        style={{
          position: "fixed",
          right: pos.x,
          bottom: pos.y,
          zIndex: 50,
          touchAction: "none",
        }}
        className="select-none"
      >
        <button
          onClick={() => !dragging && setOpen(!open)}
          className="press-scale relative w-14 h-14 rounded-full bg-[#0F5132] border-2 border-[#E0A72E] flex items-center justify-center shadow-xl shadow-black/30 cursor-grab active:cursor-grabbing overflow-hidden"
        >
          {shining && <span className="widget-shine-bar" />}
          {open ? (
            <X size={26} className="text-[#E0A72E] relative z-10" />
          ) : (
            <Icon
              icon="ix:support-ai"
              width="28"
              height="28"
              className="text-[#E0A72E] relative z-10"
            />
          )}
        </button>
      </div>

      {open && (
        <div
          style={{
            position: "fixed",
            right: pos.x,
            bottom: pos.y + 68,
            zIndex: 50,
          }}
          className="chat-pop-in w-[90vw] max-w-sm rounded-2xl bg-white border border-[#EAE1C4] shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="bg-gradient-to-r from-[#0F5132] to-[#0C4028] px-4 py-3 flex items-center gap-2.5">
            <span className="text-xl">🍀</span>
            <div>
              <p className="text-white text-sm font-bold">
                Lucky Ticket Assistant
              </p>
              <p className="text-[#B8D4C4] text-[10px]">Always here to help</p>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 max-h-80 overflow-y-auto px-4 py-3 space-y-3 bg-[#FBF8EF]"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-line ${
                    m.role === "user"
                      ? "bg-[#0F5132] text-white rounded-br-sm"
                      : "bg-white border border-[#EAE1C4] text-[#14231C] rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleAsk(s)}
                    className="rounded-full bg-white border border-[#EAE1C4] text-[#0F5132] text-xs px-3 py-1.5 hover:bg-[#E7F5EC] transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(input);
            }}
            className="flex items-center gap-2 border-t border-[#EAE1C4] p-3 bg-white"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 rounded-full border border-[#EAE1C4] px-4 py-2 text-sm focus:outline-none focus:border-[#0F5132]"
            />
            <button
              type="submit"
              className="press-scale w-9 h-9 rounded-full bg-[#0F5132] text-white flex items-center justify-center shrink-0"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
