"use client";

import { useEffect, useState } from "react";

type JsonState<T> =
  | { status: "loading"; data: null }
  | { status: "error"; data: null }
  | { status: "ready"; data: T };

export function useJson<T>(path: string): JsonState<T> {
  const [state, setState] = useState<JsonState<T>>({ status: "loading", data: null });

  useEffect(() => {
    let cancelled = false;

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
