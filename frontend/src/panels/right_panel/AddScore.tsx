import { FormEvent, useState } from "react";
import { useGameStore } from "../../GameStore";

const API_BASE_URL = process.env.REACT_APP_API_BASE ?? "http://127.0.0.1:8000";
const API_SECRET = process.env.REACT_APP_LEADERBOARD_SECRET ?? "";

async function signPayload(message: string) {
  if (!API_SECRET) {
    throw new Error("Leaderboard secret missing");
  }
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(API_SECRET),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type AddScoreProps = {
  onScoreSubmitted?: () => void;
};

export default function AddScore({ onScoreSubmitted }: AddScoreProps) {
  const { score, level, linesCleared } = useGameStore();
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const canSubmitScore = score > 0;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!canSubmitScore) {
      setError("Score must be at least 1 before submitting.");
      return;
    }

    const trimmedName = playerName.trim();

    if (trimmedName.length < 1) {
      setError("Name must be at least 1 character.");
      return;
    }

    if (trimmedName.length > 5) {
      setError("Name must be at most 5 characters.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const message = `${trimmedName}:${level}:${linesCleared}:${score}`;
      const sec = await signPayload(message);

      const response = await fetch(`${API_BASE_URL}/leaderboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          level,
          lines: linesCleared,
          score,
          sec,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save score (${response.status})`);
      }
      setPlayerName("");
      setHasSubmitted(true);
      onScoreSubmitted?.();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to submit score";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="insert-coin" style={{ overflowY: "auto", height: "100%" }}>
      <h1>YOUR SCORE</h1>
      <div style={{ marginTop: "0.5rem" }}>
        <div>Current Level: {level}</div>
        <br />
        <div>Lines Cleared: {linesCleared}</div>
        <br />
        <div>Score: {score}</div>
      </div>
      {hasSubmitted ? (
        <div
          style={{
            fontSize: "1.25rem",
            color: "#00ff90",
            textAlign: "center",
            marginTop: "1rem",
          }}
        >
          SCORE SUBMITTED
        </div>
      ) : !canSubmitScore ? (
        <div
          style={{
            fontSize: "1.1rem",
            color: "#ffdd57",
            textAlign: "center",
            marginTop: "1rem",
          }}
        >
          Score must be at least 1 before you can submit.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            justifyContent: "center",
          }}
        >
          <label htmlFor="player-name">
            <h3 style={{ textAlign: "center" }}>Please Enter Your Name</h3>
          </label>
          {error && (
            <span style={{ color: "#ff6b6b", textAlign: "center" }}>
              {error}
            </span>
          )}
          <input
            id="player-name"
            style={{
              fontSize: "1.5rem",
              textAlign: "center",
              width: "20rem",
              marginLeft: "auto",
              marginRight: "auto",
            }}
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            disabled={isSubmitting}
            maxLength={5}
            minLength={1}
          />
          <button
            className="main-button"
            style={{ width: "20rem", marginLeft: "auto", marginRight: "auto" }}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting…" : "Submit Score"}
          </button>
        </form>
      )}
      <div style={{ minHeight: "1.5rem", marginTop: "0.5rem" }}></div>
    </div>
  );
}
