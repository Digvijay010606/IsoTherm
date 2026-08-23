"use client";

import { useEffect, useState } from "react";

type JsonState<T> =
  | { status: "idle"; data: null }
  | { status: "loading"; data: null }
  | { status: "error"; data: null }
  | { status: "ready"; data: T };

export function useJson<T>(path: string | null): JsonState<T> {
  const [state, setState] = useState<JsonState<T>>(
    path === null ? { status: "idle", data: null } : { status: "loading", data: null },
  );

  useEffect(() => {
    if (path === null) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ status: "loading", data: null });

    fetch(path)
      .then((response) => {
        if (!response.ok) throw new Error(`failed to load ${path}`);
        return response.json() as Promise<T>;
      })
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", data: null });
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return state;
}
