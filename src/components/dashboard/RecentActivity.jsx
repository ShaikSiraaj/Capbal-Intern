import React from "react";
import { formatDistanceToNow } from "date-fns";
import { BookOpen, Layers, ClipboardCheck, Mic, Headphones } from "lucide-react";

const iconMap = {
  quiz: ClipboardCheck,
  flashcard: Layers,
  reading: BookOpen,
  audio: Headphones,
  voice_qa: Mic,
};

export default function RecentActivity({ sessions = [] }) {
  if (!sessions.length) {
    return (
      <div className="text-sm text-muted-foreground italic">No sessions yet — start studying to see your rhythm.</div>
    );
  }
  return (
    <ul className="space-y-4">
      {sessions.slice(0, 6).map((s) => {
        const Icon = iconMap[s.activity_type] || BookOpen;
        return (
          <li key={s.id} className="flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Icon className="w-4.5 h-4.5 text-foreground group-hover:text-primary transition-colors" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium capitalize">
                {s.activity_type.replace("_", " ")} {s.subject ? `· ${s.subject}` : ""}
              </div>
              <div className="text-xs text-muted-foreground">
                {s.duration_minutes ? `${s.duration_minutes} min · ` : ""}
                {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
