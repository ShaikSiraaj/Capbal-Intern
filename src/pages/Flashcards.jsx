import { StudyMaterial, Flashcard, StudySession } from '@/api/entities';
import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layers, Check, RotateCcw, Sparkles, Flame, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SectionHeader from "@/components/common/SectionHeader";
import EmptyState from "@/components/common/EmptyState";
import FlipCard from "@/components/flashcards/FlipCard";
import { sm2, isDue } from "@/lib/spacedRepetition";
import { useAuth } from "@/lib/AuthContext";

export default function Flashcards() {
  const qc = useQueryClient();
  const { currentUser } = useAuth();
  const email = currentUser?.email;
  const [materialId, setMaterialId] = useState("all");
  const [subject, setSubject] = useState("all");
  const [flipped, setFlipped] = useState(false);
  const [idx, setIdx] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  const { data: materials = [] } = useQuery({
    queryKey: ["materials", email],
    queryFn: () => StudyMaterial.filter({}, "-created_at", 100),
    enabled: !!email,
  });

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ["flashcards", email, materialId],
    queryFn: () => Flashcard.filter(
      materialId !== "all" ? { material_id: materialId } : {},
      "-created_at",
      500
    ),
    enabled: !!email,
  });

  const subjects = useMemo(() => Array.from(new Set(cards.map((c) => c.subject).filter(Boolean))), [cards]);

  const deck = useMemo(() => {
    let filtered = cards;
    if (subject !== "all") filtered = filtered.filter((c) => c.subject === subject);
    return filtered.filter(isDue);
  }, [cards, subject]);

  const current = deck[idx];

  const rate = async (quality) => {
    if (!current) return;
    const update = sm2(current, quality);
    await Flashcard.update(current.id, update);
    await StudySession.create({
      activity_type: "flashcard",
      subject: current.subject,
      duration_minutes: 1,
      material_id: current.material_id,
    });
    setSessionCount((s) => s + 1);
    setFlipped(false);
    if (idx + 1 >= deck.length) {
      qc.invalidateQueries({ queryKey: ["flashcards", email] });
      setIdx(0);
    } else {
      setIdx((i) => i + 1);
    }
  };

  const handleGenerate = async () => {
    const mat = materials.find(m => m.id === materialId);
    if (!mat) {
      alert("Material not found.");
      return;
    }
    if (!mat.content || mat.content.trim().length < 50) {
      alert("This material has no readable content. Please re-upload it.");
      return;
    }
    setGenerating(true);
    setGenerateError('');
    try {
      const { generateFlashcards } = await import('@/lib/ai');
      const result = await generateFlashcards(mat.content, 10);
      if (!result?.flashcards?.length) {
        throw new Error("AI returned no flashcards. Try again.");
      }
     const today = new Date().toISOString().slice(0, 10);
      await Flashcard.bulkCreate(result.flashcards.map((card) => ({
        front: card.front,
        back: card.back,
        hint: card.hint || '',
        material_id: mat.id,
        subject: mat.subject || 'General',
        next_review_date: today,
        mastery_level: 'new',
        ease_factor: 2.5,
        interval_days: 0,
        repetitions: 0,
      })));
      qc.invalidateQueries({ queryKey: ["flashcards"] });
    } catch (e) {
      console.error(e);
      setGenerateError(e.message || "Something went wrong. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Spaced repetition"
        title="Flashcards, reviewed."
        description="Rate your recall on each card. Mine schedules the next review for the perfect moment you're about to forget."
        action={
          <div className="flex items-center gap-2">
            <Select value={materialId} onValueChange={(v) => { setMaterialId(v); setIdx(0); setFlipped(false); setGenerateError(''); }}>
              <SelectTrigger className="w-52 rounded-full"><SelectValue placeholder="All materials" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All materials</SelectItem>
                {materials.map((m) => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
              </SelectContent>
            </Select>
            {subjects.length > 0 && (
              <Select value={subject} onValueChange={(v) => { setSubject(v); setIdx(0); }}>
                <SelectTrigger className="w-40 rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All subjects</SelectItem>
                  {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
        }
      />

      <div className="flex items-center gap-6 mb-6 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Layers className="w-4 h-4" /> {deck.length} due
        </span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Flame className="w-4 h-4 text-accent" /> {sessionCount} reviewed this session
        </span>
      </div>

      {isLoading ? (
        <div className="h-96 rounded-3xl bg-secondary/60 animate-pulse" />
      ) : cards.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={materialId !== "all" ? "No flashcards for this material" : "No flashcards yet"}
          description={
            materialId !== "all"
              ? "Generate flashcards from this material to start reviewing."
              : "Open a material and generate flashcards to start reviewing."
          }
          action={
            materialId !== "all" ? (
              <div className="flex flex-col items-center gap-2 mt-4">
                <Button onClick={handleGenerate} disabled={generating}>
                  {generating
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                    : <><Sparkles className="w-4 h-4 mr-2" /> Generate Flashcards</>
                  }
                </Button>
                {generateError && (
                  <p className="text-sm text-destructive">{generateError}</p>
                )}
              </div>
            ) : null
          }
        />
      ) : deck.length === 0 ? (
        <EmptyState
          icon={Check}
          title="You're all caught up!"
          description="No cards are due for review. Come back later — the spacing algorithm will bring them back at the optimal moment."
        />
      ) : (
        <div className="max-w-2xl mx-auto">
          <FlipCard card={current} flipped={flipped} onFlip={() => setFlipped(true)} />

          {!flipped ? (
            <div className="text-center text-xs text-muted-foreground mt-6">Click the card to reveal the answer</div>
          ) : (
            <div className="mt-6">
              <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground text-center mb-3">How well did you remember?</div>
              <div className="grid grid-cols-4 gap-2">
                <Button onClick={() => rate(0)} variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/5">
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Again
                </Button>
                <Button onClick={() => rate(3)} variant="outline">Hard</Button>
                <Button onClick={() => rate(4)} variant="outline">Good</Button>
                <Button onClick={() => rate(5)} className="bg-primary">
                  <Check className="w-3.5 h-3.5 mr-1.5" /> Easy
                </Button>
              </div>
            </div>
          )}

          <div className="text-center mt-5 text-xs text-muted-foreground">
            {idx + 1} of {deck.length} · {current?.mastery_level}
          </div>
        </div>
      )}
    </div>
  );
}