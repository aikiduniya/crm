import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/DataTable";
import { Progress } from "@/components/ui/progress";
import { differenceInDays, format, isAfter, isBefore, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";

type Project = {
  id: string;
  name: string;
  status: string;
  budget: number | null;
  spent: number | null;
  start_date: string | null;
  end_date: string | null;
  progress: number | null;
  description: string | null;
};

const statusColors: Record<string, string> = {
  "Planning": "bg-muted",
  "In Progress": "bg-primary",
  "Completed": "bg-success",
  "On Hold": "bg-accent",
};

export function ProjectTimeline({ projects }: { projects: Project[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const projectsWithDates = useMemo(
    () => projects.filter((p) => p.start_date),
    [projects]
  );

  const getBarStyle = (project: Project) => {
    if (!project.start_date) return null;
    const start = parseISO(project.start_date);
    const end = project.end_date ? parseISO(project.end_date) : start;
    const totalDays = days.length;

    // Clamp to month boundaries
    const barStart = isBefore(start, monthStart) ? monthStart : start;
    const barEnd = isAfter(end, monthEnd) ? monthEnd : end;

    if (isAfter(barStart, monthEnd) || isBefore(barEnd, monthStart)) return null;

    const startOffset = differenceInDays(barStart, monthStart);
    const duration = differenceInDays(barEnd, barStart) + 1;

    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`,
    };
  };

  return (
    <Card className="p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Project Timeline</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth((m) => subMonths(m, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth((m) => addMonths(m, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="relative mb-2">
        <div className="flex">
          <div className="w-48 shrink-0" />
          <div className="flex-1 flex">
            {days.filter((_, i) => i % 5 === 0).map((day) => (
              <div
                key={day.toISOString()}
                className="text-xs text-muted-foreground"
                style={{ position: "absolute", left: `calc(192px + ${(differenceInDays(day, monthStart) / days.length) * (100)}% * (1 - 192 / 100vw))` }}
              >
                {format(day, "d")}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid header */}
      <div className="flex border-b pb-2 mb-1">
        <div className="w-48 shrink-0 text-xs font-medium text-muted-foreground">Project</div>
        <div className="flex-1 relative">
          <div className="flex justify-between text-xs text-muted-foreground">
            {days.filter((_, i) => i % 7 === 0).map((day) => (
              <span key={day.toISOString()}>{format(day, "MMM d")}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Project rows */}
      <div className="space-y-1">
        {projectsWithDates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No projects with dates to display</p>
        ) : (
          projectsWithDates.map((project) => {
            const barStyle = getBarStyle(project);
            return (
              <div key={project.id} className="flex items-center h-10 group hover:bg-muted/50 rounded-md transition-colors">
                <div className="w-48 shrink-0 flex items-center gap-2 pr-3">
                  <span className="text-sm font-medium truncate">{project.name}</span>
                </div>
                <div className="flex-1 relative h-7">
                  {/* Grid lines */}
                  {days.filter((_, i) => i % 7 === 0).map((day) => (
                    <div
                      key={day.toISOString()}
                      className="absolute top-0 bottom-0 border-l border-border/30"
                      style={{ left: `${(differenceInDays(day, monthStart) / days.length) * 100}%` }}
                    />
                  ))}
                  {/* Bar */}
                  {barStyle && (
                    <div
                      className={`absolute top-1 h-5 rounded-full ${statusColors[project.status] || "bg-primary"} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center`}
                      style={barStyle}
                    >
                      <span className="text-[10px] text-primary-foreground font-medium truncate px-2">
                        {project.progress || 0}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 pt-3 border-t">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
            <span>{status}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
