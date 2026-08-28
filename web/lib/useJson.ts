"use client";

import { useEffect, useState } from "react";

type JsonState<T> =
  | { status: "idle"; data: null }
  | { status: "loading"; data: null }
  | { status: "error"; data: null }
  | { status: "ready"; data: T };

const inFlight = new Map<string, Promise<unknown>>();

function load<T>(path: string): Promise<T> {
  const cached = inFlight.get(path);
  if (cached) return cached as Promise<T>;

  const request = fetch(path)
    .then((response) => {
      if (!response.ok) throw new Error(`failed to load ${path}`);
      return response.json();
    })
    .catch((cause) => {
      inFlight.delete(path);
      throw cause;
    });

  inFlight.set(path, request);
  return request as Promise<T>;
}

export function useJson<T>(path: string | null): JsonState<T> {
  const [state, setState] = useState<JsonState<T>>(
    path === null ? { status: "idle", data: null } : { status: "loading", data: null },
  );

  useEffect(() => {
    if (path === null) return;

    let cancelled = false;

    load<T>(path)
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
