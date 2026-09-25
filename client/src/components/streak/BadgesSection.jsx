import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Lock, CheckCircle2, Flame, Sparkles } from "lucide-react";

const BadgesSection = ({ badgesData, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-lg">My Badges</CardTitle>
          <CardDescription>Loading achievements...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    badges = [],
    earnedCount = 0,
    totalBadges = 0,
    nextBadge = null,
  } = badgesData || {};

  return (
    <Card className="border-border/60 shadow-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <CardTitle className="text-xl font-bold">My Badges</CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm mt-1">
            Unlock achievements by maintaining daily learning consistency.
          </CardDescription>
        </div>
        <Badge variant="outline" className="w-fit bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800 text-xs py-1 px-3">
          {earnedCount} of {totalBadges} Badges Earned
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Next Badge Progress Card (if available) */}
        {nextBadge && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{nextBadge.icon}</span>
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 block">
                    Next Badge Up
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {nextBadge.name}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-muted-foreground">
                  {nextBadge.daysRemaining > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {nextBadge.daysRemaining} {nextBadge.daysRemaining === 1 ? "day" : "days"} remaining
                    </span>
                  ) : (
                    "Ready to unlock!"
                  )}
                </span>
              </div>
            </div>

            {/* Progress Bar & Counter */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  Streak Progress
                </span>
                <span className="font-bold text-foreground">
                  {nextBadge.progress} / {nextBadge.requirementValue} days
                </span>
              </div>
              <Progress value={nextBadge.progressPercentage} className="h-2.5 bg-muted/80" />
            </div>
          </div>
        )}

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
          {badges.map((b) => {
            const isEarned = b.isEarned;

            return (
              <div
                key={b.badgeId}
                className={`flex flex-col items-center justify-between p-3.5 rounded-xl border text-center transition-all ${
                  isEarned
                    ? "bg-gradient-to-b from-white to-amber-50/50 dark:from-slate-900 dark:to-amber-950/20 border-amber-500/40 shadow-xs hover:border-amber-500 hover:shadow-md"
                    : "bg-muted/30 border-border/60 opacity-70 hover:opacity-90"
                }`}
              >
                {/* Icon Container */}
                <div className="relative my-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-transform hover:scale-110 ${
                      isEarned
                        ? "bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border-2 border-amber-400/80 shadow-xs"
                        : "bg-muted/80 border border-border/80 grayscale opacity-60"
                    }`}
                  >
                    <span>{b.icon}</span>
                  </div>

                  {/* Top-right corner status badge */}
                  <div className="absolute -top-1 -right-1">
                    {isEarned ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-white dark:fill-slate-900" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-muted border border-border flex items-center justify-center">
                        <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Badge Name & Info */}
                <div className="mt-2 space-y-0.5 w-full">
                  <h4
                    className={`text-xs font-bold truncate ${
                      isEarned ? "text-foreground" : "text-muted-foreground"
                    }`}
                    title={b.name}
                  >
                    {b.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                    {b.requirementValue} Days Streak
                  </p>
                </div>

                {/* Bottom Status Indicator */}
                <div className="mt-2.5 pt-2 border-t border-border/40 w-full text-center">
                  {isEarned ? (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ Earned
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      {b.progress}/{b.requirementValue}d
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgesSection;
