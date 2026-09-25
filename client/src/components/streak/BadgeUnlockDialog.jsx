import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Award, ArrowRight } from "lucide-react";

const BadgeUnlockDialog = ({ isOpen, onClose, badge, onViewBadges }) => {
  if (!badge) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 text-center space-y-4 border-2 border-amber-500/40 rounded-2xl bg-card shadow-2xl">
        {/* Celebration Header Accent */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-400 to-yellow-300 flex items-center justify-center text-3xl shadow-lg animate-bounce">
          <span>{badge.icon || "🏆"}</span>
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Badge Unlocked!</span>
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-foreground pt-1">
            {badge.name}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            {badge.description}
          </DialogDescription>
        </div>

        <div className="p-3 bg-muted/50 rounded-xl border border-border/60 text-xs text-muted-foreground">
          🎉 Congratulations! Your daily consistency earned you this official SkillStack achievement.
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 cursor-pointer"
          >
            Continue
          </Button>
          <Button
            onClick={() => {
              onClose();
              if (onViewBadges) onViewBadges();
            }}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold cursor-pointer gap-1.5"
          >
            <span>View Badges</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BadgeUnlockDialog;
