import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { BookOpen, Youtube, GraduationCap, Code } from "lucide-react";

export interface SkillBadgeProps {
  skillKey: string;
  label: string;
  className?: string;
  isMissing?: boolean;
}

export function SkillBadge({ skillKey, label, className = "", isMissing = false }: SkillBadgeProps) {
  const query = encodeURIComponent(label);

  const routes = [
    {
      name: "Watch on YouTube",
      url: `https://www.youtube.com/results?search_query=${query}+tutorial+course`,
      icon: Youtube,
      color: "text-red-500 dark:text-red-400 focus:text-red-600 dark:focus:text-red-300 focus:bg-red-500/10",
    },
    {
      name: "Coursera Certificates",
      url: `https://www.coursera.org/search?query=${query}`,
      icon: GraduationCap,
      color: "text-blue-500 dark:text-blue-400 focus:text-blue-600 dark:focus:text-blue-300 focus:bg-blue-500/10",
    },
    {
      name: "Practice on LeetCode",
      url: `https://leetcode.com/problemset/all/?search=${query}`,
      icon: Code,
      color: "text-amber-600 dark:text-amber-400 focus:text-amber-700 dark:focus:text-amber-300 focus:bg-amber-500/10",
    },
  ];

  return (
    <div 
      className="inline-block"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer active:scale-95 select-none ${
              isMissing
                ? "bg-red-500/5 text-red-550 dark:text-red-400 border-red-500/20 hover:bg-red-500/10 hover:border-red-400/40"
                : "bg-indigo-500/5 text-indigo-650 dark:text-indigo-300 border-indigo-500/20 dark:border-indigo-500/10 hover:bg-indigo-500/10 dark:hover:bg-indigo-500/10 hover:border-indigo-500/30 dark:hover:border-indigo-400/40"
            } ${className}`}
          >
            <BookOpen className="h-3 w-3 shrink-0" />
            {label}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-56 bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] rounded-xl p-1 shadow-2xl z-[100]"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] px-2 py-1.5">
            Learning Pathways for {label}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[var(--border)]" />
          {routes.map((route) => {
            const Icon = route.icon;
            return (
              <DropdownMenuItem
                key={route.name}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  window.open(route.url, "_blank", "noopener,noreferrer");
                }}
                className={`flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg cursor-pointer transition-colors ${route.color}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-semibold text-[var(--foreground)]">{route.name}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
