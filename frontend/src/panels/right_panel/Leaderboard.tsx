import { useCallback, useEffect, useState } from "react";

const PAGE_SIZE = 10;
const API_BASE_URL =
  process.env.REACT_APP_API_BASE ?? "http://bossadapt.org/tetris/api";

type LeaderboardEntry = {
  rank: number;
  name: string;
  level: number;
  lines: number;
  score: number;
};

type LeaderboardProps = {
  refreshToken?: number;
};

export default function Leaderboard({ refreshToken = 0 }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (index: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const offset = index * PAGE_SIZE;
      const response = await fetch(
        `${API_BASE_URL}/leaderboard?limit=${PAGE_SIZE}&offset=${offset}`
      );

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      const data = (await response.json()) as LeaderboardEntry[];
      setEntries(data);
      setPageIndex(index);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load leaderboard";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(0);
  }, [fetchPage, refreshToken]);

  const generateBody = () => {
    const rows = [];
    for (let i = 0; i < PAGE_SIZE; i++) {
      const current = entries[i];
      rows.push(
        <tr key={current ? current.rank : `empty-${i}`}>
          <td>{current ? current.rank : "-"}</td>
          <td>{current ? current.name : "-"}</td>
          <td>{current ? current.level : "-"}</td>
          <td>{current ? current.lines : "-"}</td>
          <td>{current ? current.score : "-"}</td>
        </tr>
      );
    }
    return rows;
  };

  const handlePrevious = () => {
    if (pageIndex === 0 || isLoading) {
      return;
    }
    fetchPage(pageIndex - 1);
  };

  const handleNext = () => {
    if (isLoading) {
      return;
    }
    fetchPage(pageIndex + 1);
  };

  return (
    <div
      className="insert-coin"
      style={{
        display: "flex",
        flexDirection: "column",
        color: "white",
        width: "100%",
      }}
    >
      <h1>LEADERBOARD</h1>
      {error ? (
        <div style={{ color: "#ff6b6b", minHeight: "3rem" }}>{error}</div>
      ) : (
        <>
          <table className="leader_board_table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Level</th>
                <th>Lines</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>{generateBody()}</tbody>
          </table>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "0.5rem",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <button
              className="main-button"
              onClick={handlePrevious}
              disabled={pageIndex === 0 || isLoading}
            >
              Prev
            </button>
            <span style={{ minWidth: "4rem", textAlign: "center" }}>
              Page {pageIndex + 1}
            </span>
            <button
              className="main-button"
              onClick={handleNext}
              disabled={isLoading}
            >
              Next
            </button>
          </div>
        </>
      )}
      <div style={{ minHeight: "1.5rem", marginTop: "0.5rem" }}>
        {isLoading && <span>Loading leaderboard…</span>}
      </div>
    </div>
  );
}
