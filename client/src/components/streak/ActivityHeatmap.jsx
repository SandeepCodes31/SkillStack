import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Flame } from "lucide-react";

const ActivityHeatmap = ({ activityData, isLoading = false }) => {
  const [hoveredDay, setHoveredDay] = useState(null);

  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">Learning Activity</CardTitle>
          <CardDescription>Loading calendar history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-36 bg-muted rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const { calendarDays = [], totalDaysTracked = 112 } = activityData || {};

  // Group days into 7-day columns (weeks)
  // Each column represents one week (Sunday to Saturday or Mon to Sun)
  const weeks = [];
  let currentWeek = [];

  calendarDays.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === calendarDays.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const getIntensityClass = (intensity) => {
    switch (intensity) {
      case 1:
        return "bg-emerald-200 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-800";
      case 2:
        return "bg-emerald-400 dark:bg-emerald-700 border-emerald-500 dark:border-emerald-600";
      case 3:
        return "bg-emerald-600 dark:bg-emerald-500 border-emerald-700 dark:border-emerald-400";
      case 4:
        return "bg-emerald-800 dark:bg-emerald-400 border-emerald-900 dark:border-emerald-300";
      default:
        return "bg-muted/60 dark:bg-muted/40 border-border/40 hover:border-border";
    }
  };

  const totalActivitiesInPeriod = calendarDays.reduce((sum, d) => sum + (d.count || 0), 0);
  const activeDaysInPeriod = calendarDays.filter((d) => d.count > 0).length;

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl font-bold">Learning Activity</CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm mt-1">
            {activeDaysInPeriod} active learning days ({totalActivitiesInPeriod} activities completed) in the last 16 weeks.
          </CardDescription>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground self-start sm:self-auto">
          <span>Less</span>
          <span className="w-3 h-3 rounded-[3px] bg-muted/60 dark:bg-muted/40 border border-border/40" />
          <span className="w-3 h-3 rounded-[3px] bg-emerald-200 dark:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800" />
          <span className="w-3 h-3 rounded-[3px] bg-emerald-400 dark:bg-emerald-700 border border-emerald-500 dark:border-emerald-600" />
          <span className="w-3 h-3 rounded-[3px] bg-emerald-600 dark:bg-emerald-500 border border-emerald-700 dark:border-emerald-400" />
          <span className="w-3 h-3 rounded-[3px] bg-emerald-800 dark:bg-emerald-400 border border-emerald-900 dark:border-emerald-300" />
          <span>More</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Heatmap Grid Wrapper (Scrollable on small screens) */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-flex gap-1.5 min-w-full">
            {weeks.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-1.5">
                {week.map((day) => {
                  const dateFormatted = new Date(day.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <div
                      key={day.date}
                      onMouseEnter={() => setHoveredDay({ ...day, formatted: dateFormatted })}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] border transition-all cursor-pointer ${getIntensityClass(
                        day.intensity
                      )} hover:scale-125 hover:z-10`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Tooltip / Hover Detail Bar */}
        <div className="h-6 flex items-center text-xs text-muted-foreground border-t border-border/40 pt-2">
          {hoveredDay ? (
            <span className="font-medium text-foreground flex items-center gap-1.5 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {hoveredDay.count > 0 ? (
                <span>
                  <strong>{hoveredDay.count}</strong> learning {hoveredDay.count === 1 ? "activity" : "activities"} on <strong>{hoveredDay.formatted}</strong>
                </span>
              ) : (
                <span>No learning activity on {hoveredDay.formatted}</span>
              )}
            </span>
          ) : (
            <span className="italic text-muted-foreground/80">
              Hover over calendar squares to view daily activity details.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityHeatmap;
