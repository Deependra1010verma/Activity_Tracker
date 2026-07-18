"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { generateCardsForConcept } from "@/lib/card-generator";
import { learnerModeCopy, learnerModeLabels } from "@/lib/profile-copy";
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
      setError("Supabase env values missing hain. `.env` verify karo.");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase client initialize nahi ho paaya.");
      return;
    }

    const parsedConcepts = concepts
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!topic.trim() || !notes.trim() || parsedConcepts.length === 0) {
      setError("Topic, notes, aur kam se kam 1 concept required hai.");
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

      if (subjectError) {
        throw subjectError;
      }

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

      if (entryError) {
        throw entryError;
      }

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

      if (conceptError) {
        throw conceptError;
      }

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

      if (cardError) {
        throw cardError;
      }

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

        if (tagError) {
          throw tagError;
        }
      }

      setMessage(
        `Learning saved. ${parsedConcepts.length} concepts aur ${cardPayload.length} starter cards create ho gaye.`,
      );
      setTopic("");
      setNotes("");
      setConcepts("");
      router.refresh();
    } catch (submissionError) {
      const nextError =
        submissionError instanceof Error
          ? submissionError.message
          : "Unexpected save error aaya.";
      setError(nextError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid-two">
      <div className="section-panel">
        <span className="eyebrow">{learnerModeLabels[profile.learnerMode]}</span>
        <h2 className="section-title">Capture for {profile.fullName}</h2>
        <p className="section-copy">
          {modeCopy.hero} Final app me ye form current logged-in profile ke data me save
          hoga, so tum dono ke cards aur schedules alag rahenge.
        </p>

        <form className="capture-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="topic">
              {profile.learnerMode === "general" ? "Topic title" : "Chapter or topic"}
            </label>
            <input
              id="topic"
              name="topic"
              onChange={(event) => setTopic(event.target.value)}
              placeholder={
                profile.learnerMode === "general"
                  ? "Example: Binary search fundamentals"
                  : "Example: Cell organelles"
              }
              value={topic}
            />
          </div>

          {profile.learnerMode !== "general" ? (
            <div className="field">
              <label htmlFor="source">
                {profile.learnerMode === "neet" ? "Source" : "Revision source"}
              </label>
              <select
                id="source"
                name="source"
                onChange={(event) => setSourceType(event.target.value)}
                value={sourceType}
              >
                <option>NCERT</option>
                <option>Module</option>
                <option>Class notes</option>
                <option>Test mistake</option>
              </select>
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="notes">
              {profile.learnerMode === "general"
                ? "What did you learn?"
                : "What did you revise?"}
            </label>
            <textarea
              id="notes"
              name="notes"
              onChange={(event) => setNotes(event.target.value)}
              placeholder={modeCopy.captureLabel}
              value={notes}
            />
          </div>

          <div className="field">
            <label htmlFor="concepts">
              {profile.learnerMode === "neet"
                ? "High-yield lines or facts"
                : "Atomic concepts"}
            </label>
            <textarea
              id="concepts"
              name="concepts"
              onChange={(event) => setConcepts(event.target.value)}
              placeholder={modeCopy.conceptsLabel}
              value={concepts}
            />
          </div>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : `Save for ${profile.fullName}`}
          </button>

          {message ? (
            <p className="section-copy" style={{ color: "#166534", margin: 0 }}>
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="section-copy" style={{ color: "#b91c1c", margin: 0 }}>
              {error}
            </p>
          ) : null}
        </form>
      </div>

      <div className="section-panel">
        <span className="eyebrow">Question behavior</span>
        <h3 className="section-title">Prompt variants for {profile.fullName}</h3>
        <p className="section-copy">
          Same database rahega, but prompts learner mode ke hisaab se generate honge.
        </p>
        <div className="template-grid">
          {modeCopy.prompts.map((template) => (
            <article className="template" key={template.title}>
              <h4>{template.title}</h4>
              <p className="section-copy" style={{ marginTop: "0.45rem" }}>
                {template.copy}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
