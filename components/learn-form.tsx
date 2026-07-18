"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { generateCardsForConcept } from "@/lib/card-generator";
import { learnerModeCopy } from "@/lib/profile-copy";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { Profile } from "@/lib/types";

type LearnFormViewProps = {
  profile: Profile;
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

export function LearnFormView({ profile }: LearnFormViewProps) {
  const router = useRouter();
  const modeCopy = learnerModeCopy[profile.learnerMode];
  const [topic, setTopic] = useState("");
  const subject =
    profile.learnerMode === "general" ? "General Memory Space" : "School + NEET Space";
  const [sourceType, setSourceType] = useState(
    profile.learnerMode === "general" ? "self notes" : "NCERT",
  );
  const [notes, setNotes] = useState("");
  const [concepts, setConcepts] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
    <div className="centered-page">
      <div className="cute-card" style={{ maxWidth: "650px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 className="cute-title" style={{ fontSize: "2.2rem" }}>Log New Learning {profile.learnerMode === "neet" ? "🌸" : "⚡"}</h2>
          <p className="cute-subtitle">What did you learn today? Let's make sure it sticks forever.</p>
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
            <label htmlFor="concepts">Key Atomic Concepts (One per line)</label>
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
            />
          </div>

          <button className="btn-primary" disabled={isSubmitting} type="submit" style={{ marginTop: "1rem" }}>
            {isSubmitting ? "Saving Magic..." : "Save Learning"}
          </button>
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
