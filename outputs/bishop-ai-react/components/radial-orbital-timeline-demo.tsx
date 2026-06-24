"use client";

import { Calendar, Code, FileText, User, Clock } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const timelineData = [
  {
    id: 1,
    title: "1. Operational Audit & Planning",
    date: "Stage 01",
    content: "Complete operational gap audit. We map GTM database systems and locate major time-leaks.",
    category: "Planning",
    icon: Calendar,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "2. GTM System Architecture",
    date: "Stage 02",
    content: "Designing clean CRM integration schemas, database filters, and custom n8n middleware diagrams.",
    category: "Design",
    icon: FileText,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 90,
  },
  {
    id: 3,
    title: "3. Middleware & Pipeline Build",
    date: "Stage 03",
    content: "Writing custom API connectors, n8n workflow routines, and Salesforce lead-routing properties.",
    category: "Development",
    icon: Code,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 60,
  },
  {
    id: 4,
    title: "4. Sandbox Simulation & Tests",
    date: "Stage 04",
    content: "Running GTM simulations in sandbox staging environments to verify data compliance and routing speed.",
    category: "Testing",
    icon: User,
    relatedIds: [3, 5],
    status: "pending" as const,
    energy: 30,
  },
  {
    id: 5,
    title: "5. Production Launch & Training",
    date: "Stage 05",
    content: "Deploying live integration engines and delivering custom prompt engineering manuals for sales staff.",
    category: "Release",
    icon: Clock,
    relatedIds: [4],
    status: "pending" as const,
    energy: 10,
  },
];

export function RadialOrbitalTimelineDemo() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-lg mb-8">
        <span className="text-xs uppercase tracking-widest text-[#E8B84B] font-semibold">Interactive GTM Blueprint</span>
        <h2 className="text-2xl font-bold text-white mt-1">Bishop AI Project Lifecycle</h2>
        <p className="text-xs text-neutral-400 mt-2">Click on any stage node in the orbit to view connection matrices, project energy status, and delivery milestones.</p>
      </div>
      <div className="w-full max-w-4xl h-[600px] border border-neutral-800 rounded-lg overflow-hidden relative bg-black">
        <RadialOrbitalTimeline timelineData={timelineData} />
      </div>
    </div>
  );
}

export default {
  RadialOrbitalTimelineDemo,
};
