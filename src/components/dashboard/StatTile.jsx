import React from "react";
import { motion } from "framer-motion";

export default function StatTile({ label, value, sub, icon: Icon, accent }) {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-card border border-border/60 rounded-2xl p-5 deckle-edge relative overflow-hidden transition-colors hover:border-primary/20"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-3">{label}</div>
          <div className="font-serif text-4xl font-semibold tracking-tight text-foreground">{value}</div>
          {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent || "bg-secondary text-foreground"}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
}