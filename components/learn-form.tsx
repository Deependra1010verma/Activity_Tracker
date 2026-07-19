"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateCardsForConcept } from "@/lib/card-generator";
import { learnerModeCopy } from "@/lib/profile-copy";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { Profile } from "@/lib/types";

type LearnFormViewProps = {
  profile: Profile;
  editEntry?: {
    id: string;
    title: string;
    summary: string;
    concepts: string[];
  };
};

type SubjectIdRow = {
  id: string;
};
type EntryIdRow = {
  id: string;
};
type ConceptInsertRow = {
  id: string;
  concept_text: string;
};
type CardIdRow = {
  id: string;
};

export function LearnFormView({ profile, editEntry }: LearnFormViewProps) {
  const router = useRouter();
  const modeCopy = learnerModeCopy[profile.learnerMode];
  const [topic, setTopic] = useState(editEntry?.title ?? "");
  const subject =
    profile.learnerMode === "general" ? "General Memory Space" : "School + NEET Space";
  const [sourceType, setSourceType] = useState(
    profile.learnerMode === "general" ? "self notes" : "NCERT",
  );
  const [notes, setNotes] = useState(editEntry?.summary ?? "");
  const [concepts, setConcepts] = useState(editEntry?.concepts?.join("\n") ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleGenerateAI() {
    setError("");
    setMessage("");
    if (!topic.trim() || !notes.trim()) {
      setError("Please fill out the Topic and Your Notes first so AI knows what to generate!");
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const response = await fetch("/api/generate-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: notes, topic, learnerMode: profile.learnerMode })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI generation failed");
      
      setConcepts(data.concepts.join("\n"));
      setMessage("AI successfully extracted concepts! You can review them below.");
    } catch (err: any) {
      setError(err.message || "Failed to connect to AI");
    } finally {
      setIsGeneratingAI(false);
    }
  }

  async function handleDelete() {
    if (!editEntry || !confirm("Are you sure you want to delete this note and all its flashcards?")) return;
    
    setIsDeleting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Could not connect to database.");
      
      const { error: delError } = await supabase
        .from("learning_entries")
        .delete()
        .eq("id", editEntry.id);
        
      if (delError) throw delError;
      
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete note.");
      setIsDeleting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!hasSupabaseEnv()) {
      setError("Database is not configured properly.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Could not connect to database.");
      return;
    }

    const parsedConcepts = concepts
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!topic.trim() || !notes.trim() || parsedConcepts.length === 0) {
      setError("Please fill out the topic, your notes, and at least 1 key concept!");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editEntry) {
        // UPDATE EXISTING ENTRY
        const { error: updateError } = await supabase
          .from("learning_entries")
          .update({
            title: topic.trim(),
            summary: notes.trim(),
            source_notes: notes.trim(),
          })
          .eq("id", editEntry.id);

        if (updateError) throw updateError;
        setMessage("Note updated successfully!");
        router.push("/");
        router.refresh();
        return;
      }

      // CREATE NEW ENTRY
      const { data: rawSubjectRow, error: subjectError } = await supabase
        .from("subjects")
        .select("id")
        .eq("profile_id", profile.id)
        .eq("name", subject)
        .maybeSingle();

      if (subjectError) throw subjectError;

      const subjectRow = rawSubjectRow as SubjectIdRow | null;

      const { data: rawEntry, error: entryError } = await supabase
        .from("learning_entries")
        .insert({
          profile_id: profile.id,
          subject_id: subjectRow?.id ?? null,
          title: topic.trim(),
          subject,
          source_type: sourceType.trim() || null,
          summary: notes.trim(),
          source_notes: notes.trim(),
        })
        .select("id")
        .single();

      if (entryError) throw entryError;

      const entry = rawEntry as EntryIdRow;

      const { data: rawConceptRows, error: conceptError } = await supabase
        .from("concepts")
        .insert(
          parsedConcepts.map((conceptText) => ({
            learning_entry_id: entry.id,
            concept_text: conceptText,
          })),
        )
        .select("id, concept_text");

      if (conceptError) throw conceptError;

      const conceptRows = (rawConceptRows ?? []) as ConceptInsertRow[];

      const generatedCards = conceptRows.flatMap((conceptRow) =>
        generateCardsForConcept(conceptRow.concept_text, profile.learnerMode, subject).map(
          (card) => ({
            conceptId: conceptRow.id,
            promptStyle: card.promptStyle,
            prompt: card.prompt,
            answer: card.answer,
            examPriority: card.examPriority,
            tags: card.tags,
          }),
        ),
      );

      const cardPayload = generatedCards.map((card) => ({
        concept_id: card.conceptId,
        prompt_style: card.promptStyle,
        prompt: card.prompt,
        answer: card.answer,
        exam_priority: card.examPriority,
      }));

      const { data: rawCreatedCards, error: cardError } = await supabase
        .from("cards")
        .insert(cardPayload)
        .select("id");

      if (cardError) throw cardError;

      const createdCards = (rawCreatedCards ?? []) as CardIdRow[];
      const tagPayload =
        createdCards?.flatMap((card, index) =>
          generatedCards[index].tags.map((tag) => ({
            card_id: card.id,
            tag,
          })),
        ) ?? [];

      if (tagPayload.length > 0) {
        const { error: tagError } = await supabase.from("card_tags").insert(tagPayload);
        if (tagError) throw tagError;
      }

      setMessage(`Yay! 🎉 Saved successfully. We'll remind you about this soon.`);
      setTopic("");
      setNotes("");
      setConcepts("");
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="centered-page" style={{ position: "relative" }}>
      <div className="cute-card" style={{ maxWidth: "650px", width: "100%", position: "relative", marginTop: "2rem" }}>
        <Link href="/" className="btn-back">
          ← Back to Dashboard
        </Link>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 className="cute-title" style={{ fontSize: "2.2rem" }}>
            {editEntry ? "Review Note" : "Log New Learning"} {profile.learnerMode === "neet" ? "🐼🌸🎀" : "⚡"}
          </h2>
        </div>

        <form className="cute-form" onSubmit={handleSubmit}>
          <div className="cute-field">
            <label htmlFor="topic">Topic Title</label>
            <input
              id="topic"
              name="topic"
              className="cute-input"
              onChange={(event) => setTopic(event.target.value)}
              placeholder={profile.learnerMode === "general" ? "e.g. Basics of Binary Search" : "e.g. Cell organelles"}
              value={topic}
            />
          </div>

          <div className="cute-field">
            <label htmlFor="notes">Your Notes</label>
            <textarea
              id="notes"
              name="notes"
              className="cute-input"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Summarize what you learned in your own words..."
              value={notes}
            />
          </div>

          <div className="cute-field">
            <label htmlFor="concepts">
              Key Atomic Concepts (One per line)
              {!editEntry && (
                <button 
                  type="button" 
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI}
                  style={{ marginLeft: "1rem", background: "none", border: "1px solid var(--primary)", color: "var(--primary)", borderRadius: "var(--radius-pill)", padding: "0.25rem 0.75rem", fontSize: "0.8rem", cursor: "pointer", fontWeight: "bold" }}
                >
                  {isGeneratingAI ? "Generating..." : "✨ Generate with AI"}
                </button>
              )}
            </label>
            <textarea
              id="concepts"
              name="concepts"
              className="cute-input"
              onChange={(event) => setConcepts(event.target.value)}
              placeholder={
                profile.learnerMode === "general"
                  ? "1. Binary search needs sorted array\n2. Time complexity is O(log n)"
                  : "1. Mitochondria is the powerhouse of the cell\n2. Ribosomes synthesize proteins"
              }
              value={concepts}
              readOnly={!!editEntry}
              style={{ opacity: editEntry ? 0.7 : 1 }}
            />
          </div>

          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
            <button className="btn-primary" disabled={isSubmitting} type="submit" style={{ flex: 1 }}>
              {isSubmitting ? "Saving Magic..." : editEntry ? "Save Updates" : "Save Learning"}
            </button>
            {editEntry && (
              <button 
                type="button" 
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-primary" 
                style={{ flex: 1, background: "transparent", border: "2px solid var(--again)", color: "var(--again)", boxShadow: "none" }}
              >
                {isDeleting ? "Deleting..." : "Delete Note"}
              </button>
            )}
          </div>
        </form>

        {message ? (
          <div className="msg-success" style={{ marginTop: "1.5rem" }}>{message}</div>
        ) : null}

        {error ? (
          <div className="msg-error" style={{ marginTop: "1.5rem" }}>{error}</div>
        ) : null}
      </div>
    </div>
  );
}
