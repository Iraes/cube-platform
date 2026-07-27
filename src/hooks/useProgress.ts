"use client";

import { useCallback, useEffect, useState } from "react";
import { getReadLessons, getSolvedTasks, subscribeToProgress } from "@/lib/progress";

type ProgressState = {
  lessons: Set<string>;
  tasks: Set<string>;
  /** false до первого чтения localStorage — чтобы не разошлась гидратация */
  ready: boolean;
};

const EMPTY: ProgressState = { lessons: new Set(), tasks: new Set(), ready: false };

export function useProgress(): ProgressState {
  const [state, setState] = useState<ProgressState>(EMPTY);

  const refresh = useCallback(() => {
    setState({ lessons: getReadLessons(), tasks: getSolvedTasks(), ready: true });
  }, []);

  useEffect(() => {
    refresh();
    return subscribeToProgress(refresh);
  }, [refresh]);

  return state;
}
