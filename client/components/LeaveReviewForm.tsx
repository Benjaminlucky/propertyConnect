"use client";

import { useState, useActionState } from "react";
import { submitReview } from "@/lib/review-actions";
import type { ReviewState } from "@/lib/review-actions";
import { CheckCircle2, Star } from "lucide-react";

interface Props {
  agentId:   string;
  agentSlug: string;
  agentName: string;
}

export function LeaveReviewForm({ agentId, agentSlug, agentName }: Props) {
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview, null);

  if (state?.ok) {
    return (
      <div className="rv-success">
        <CheckCircle2 size={26} strokeWidth={2} color="var(--ok)" />
        <p>Thank you — your review has been published.</p>
      </div>
    );
  }

  return (
    <form className="rv-form" action={action}>
      <input type="hidden" name="agentId"   value={agentId} />
      <input type="hidden" name="agentSlug" value={agentSlug} />
      <input type="hidden" name="rating"    value={rating} />

      <p className="rv-form__intro">
        Worked with {agentName.split(" ")[0]}? Leave an honest review to help other buyers.
      </p>

      {/* Star picker */}
      <div className="rv-stars" role="group" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`rv-star${(hovered || rating) >= n ? " rv-star--on" : ""}`}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
          >
            <Star size={26} strokeWidth={1.5} />
          </button>
        ))}
        {rating > 0 && (
          <span className="rv-star-label">
            {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
          </span>
        )}
      </div>

      <div className="rv-form__row">
        <label className="rv-form__label" htmlFor="rv-name">Your name</label>
        <input
          id="rv-name"
          name="name"
          className="rv-form__input"
          type="text"
          placeholder="e.g. Amaka Obi"
          required
          minLength={2}
          maxLength={80}
        />
      </div>

      <div className="rv-form__row">
        <label className="rv-form__label" htmlFor="rv-comment">Your review</label>
        <textarea
          id="rv-comment"
          name="comment"
          className="rv-form__input rv-form__textarea"
          placeholder={`How was your experience with ${agentName.split(" ")[0]}? Be specific — responsiveness, accuracy of listings, professionalism.`}
          required
          minLength={10}
          maxLength={600}
          rows={4}
        />
      </div>

      {state?.error && (
        <p className="rv-form__error">{state.error}</p>
      )}

      <button
        type="submit"
        className="rv-form__submit"
        disabled={pending || rating === 0}
      >
        {pending ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}
