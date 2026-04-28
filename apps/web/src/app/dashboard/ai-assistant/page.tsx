"use client";

import { useMemo, useState } from "react";

type AgentCard = {
  name: string;
  role: string;
  status: string;
};

type AlertItem = {
  title: string;
  detail: string;
  tone: "high" | "medium" | "low";
};

type ReportItem = {
  title: string;
  time: string;
  summary: string;
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const agents: AgentCard[] = [
  { name: "Performance Agent", role: "Tracks weak students, test trends, and branch-level learning gaps.", status: "Watching 128 active students" },
  { name: "Attendance Agent", role: "Flags absences, missed days, and delayed course completion risk.", status: "9 students need follow-up" },
  { name: "Finance Agent", role: "Summarizes dues, refunds, installment risk, and collection health.", status: "4 refunds need review" },
  { name: "Operations Agent", role: "Monitors slot swaps, trainer load, pauses, and daily branch pressure.", status: "3 trainer changes pending" }
];

const alerts: AlertItem[] = [
  { title: "High absence risk", detail: "6 students are likely to miss target completion dates this week.", tone: "high" },
  { title: "Refund review queue", detail: "4 stop-and-refund cases are waiting for admin approval.", tone: "medium" },
  { title: "Trainer load imbalance", detail: "Rankala morning batch has 2 trainers handling more students than planned.", tone: "medium" },
  { title: "Video lecture backlog", detail: "18 students are behind on more than 3 lecture days.", tone: "low" }
];

const reports: ReportItem[] = [
  { title: "Today’s admin brief", time: "Updated 10 min ago", summary: "Admissions are steady, attendance risk is rising in 15-day courses, and one branch needs trainer redistribution." },
  { title: "Refund and payment summary", time: "Updated 35 min ago", summary: "Collections are healthy, but refund requests increased after 5 pause-to-stop conversions." },
  { title: "Trainer performance snapshot", time: "Updated 1 hour ago", summary: "Two trainers have excellent completion rates, while one branch needs more feedback logging discipline." }
];

const quickPrompts = [
  "Show students with low attendance this week",
  "Give me a refund risk summary for all branches",
  "Which trainer needs support today?",
  "Prepare today’s admin report"
];

const seededMessages: ChatMessage[] = [
  {
    id: "assistant-1",
    role: "assistant",
    content: "Good morning. I can analyze students, attendance, refunds, trainer workload, and branch performance. Ask a question or assign a task."
  },
  {
    id: "user-1",
    role: "user",
    content: "Give me the main things I should focus on today."
  },
  {
    id: "assistant-2",
    role: "assistant",
    content: "Today’s priorities: 1) review 4 refund cases, 2) follow up with 9 attendance-risk students, 3) rebalance Rankala morning trainer load, and 4) close 3 pending trainer-change actions."
  }
];

function buildAssistantReply(input: string) {
  const text = input.toLowerCase();
  if (text.includes("refund")) {
    return "Refund view: 4 active cases need approval, 2 are bank transfer ready, and the highest suggested refund today is Rs 4,200. I recommend reviewing stop date, completed days, and payment mode before approval.";
  }
  if (text.includes("attendance")) {
    return "Attendance view: 9 students are at risk this week. Most of them are from 15-day courses, and 3 of them already have two missed days in a short window.";
  }
  if (text.includes("trainer")) {
    return "Trainer view: Rankala morning batch is overloaded, one trainer has repeated reassignment requests, and two trainers have strong completion rates that make them good backup candidates.";
  }
  if (text.includes("report")) {
    return "Draft admin report: admissions are stable, refunds need tighter approval handling, attendance slippage is concentrated in short-duration courses, and video lecture completion needs daily follow-up.";
  }
  return "I can help with branch performance, attendance risk, refunds, trainer workload, student progress, and operational alerts. Try asking for a summary, a list, or a branch-wise report.";
}

function toneClasses(tone: AlertItem["tone"]) {
  if (tone === "high") return "bg-[#f5d7d0] text-[#8f3c2d]";
  if (tone === "medium") return "bg-[#f4e6c8] text-[#8a6222]";
  return "bg-[#dde8de] text-[#2d6a45]";
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(seededMessages);
  const [draft, setDraft] = useState("");
  const [activeAgent, setActiveAgent] = useState(agents[0].name);

  const activeAgentSummary = useMemo(
    () => agents.find((agent) => agent.name === activeAgent) ?? agents[0],
    [activeAgent]
  );

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed
    };
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now() + 1}`,
      role: "assistant",
      content: buildAssistantReply(trimmed)
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setDraft("");
  }

  return (
    <div className="grid gap-6 pb-8">
      <section className="rounded-md border border-[#e4ddd2] bg-[#f7f3eb] px-5 py-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-[#8d7a63]">AI Admin Assistant</p>
            <h1 className="mt-2 text-3xl font-bold text-[#2f2a25]">A calm control room for analysis, alerts, and admin decisions.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f574d]">
              Ask for reports, branch summaries, student risk analysis, refund review, trainer load balancing, or operational alerts. The layout is designed to feel conversational and focused, with a warm neutral background similar to Claude-style chat surfaces.
            </p>
          </div>
          <div className="rounded-md border border-[#ddd1bf] bg-[#fbf8f2] px-4 py-3 text-sm text-[#5f574d]">
            <p className="font-semibold text-[#2f2a25]">{activeAgentSummary.name}</p>
            <p className="mt-1">{activeAgentSummary.status}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <div className="min-w-0 rounded-md border border-[#e6dfd2] bg-[#f7f5f2]">
          <div className="border-b border-[#e6dfd2] px-4 py-4 sm:px-5">
            <div className="flex flex-wrap items-center gap-2">
              {agents.map((agent) => (
                <button
                  key={agent.name}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                    activeAgent === agent.name
                      ? "border-[#2e8f87] bg-[#e8f4f2] text-[#216a64]"
                      : "border-[#e0d8cb] bg-[#fbf8f3] text-[#5f574d] hover:border-[#cbbda8]"
                  }`}
                  onClick={() => setActiveAgent(agent.name)}
                  type="button"
                >
                  {agent.name}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-[#5f574d]">{activeAgentSummary.role}</p>
          </div>

          <div className="grid gap-4 px-4 py-5 sm:px-5">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="rounded-md border border-[#e0d8cb] bg-[#fbf8f3] px-3 py-2 text-left text-sm text-[#4f473f] transition hover:border-[#cdbda8] hover:bg-white"
                  onClick={() => sendMessage(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="grid gap-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[90%] rounded-md px-4 py-3 text-sm leading-6 ${
                    message.role === "assistant"
                      ? "bg-[#ece7df] text-[#2f2a25]"
                      : "ml-auto bg-[#d9ece7] text-[#1f4c47]"
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#e6dfd2] bg-[#fbf8f2] px-4 py-4 sm:px-5">
            <div className="grid gap-3">
              <textarea
                className="min-h-[104px] rounded-md border border-[#ddd3c4] bg-white px-4 py-3 text-sm text-[#2f2a25] outline-none transition placeholder:text-[#9b8f7e] focus:border-[#2e8f87]"
                placeholder="Ask for reports, alerts, student analysis, trainer performance, refund review, or give a task to an agent..."
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[#786e61]">This first version is UI-ready for future model and agent integration.</p>
                <button
                  className="rounded-md bg-[#2e8f87] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#24766f]"
                  onClick={() => sendMessage(draft)}
                  type="button"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <section className="rounded-md border border-[#e6dfd2] bg-[#faf7f1] px-4 py-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[#2f2a25]">Alerts</h2>
              <span className="rounded-md bg-[#ece7df] px-2.5 py-1 text-xs font-semibold text-[#665d52]">{alerts.length} active</span>
            </div>
            <div className="mt-4 grid gap-3">
              {alerts.map((alert) => (
                <div key={alert.title} className="border-b border-[#ece4d7] pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-[#2f2a25]">{alert.title}</p>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${toneClasses(alert.tone)}`}>
                      {alert.tone}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#5f574d]">{alert.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-[#e6dfd2] bg-[#faf7f1] px-4 py-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[#2f2a25]">Ready Reports</h2>
              <span className="rounded-md bg-[#ece7df] px-2.5 py-1 text-xs font-semibold text-[#665d52]">{reports.length} summaries</span>
            </div>
            <div className="mt-4 grid gap-4">
              {reports.map((report) => (
                <div key={report.title} className="rounded-md border border-[#e8dfd2] bg-[#fffdf9] px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-[#2f2a25]">{report.title}</p>
                    <span className="text-xs font-semibold text-[#8a7d6c]">{report.time}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#5f574d]">{report.summary}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-[#e6dfd2] bg-[#faf7f1] px-4 py-5">
            <h2 className="text-lg font-bold text-[#2f2a25]">Agent Tasks</h2>
            <div className="mt-4 grid gap-3">
              {[
                "Review refund cases above suggested amount",
                "Find students with attendance risk in 15-day course",
                "Prepare branch-wise trainer load summary",
                "Notify admin about payment follow-up gaps"
              ].map((task) => (
                <button
                  key={task}
                  className="rounded-md border border-[#e0d8cb] bg-[#fffdf9] px-3 py-3 text-left text-sm font-semibold text-[#4f473f] transition hover:border-[#cdbda8]"
                  onClick={() => sendMessage(task)}
                  type="button"
                >
                  {task}
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
