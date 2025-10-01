"use client";

import { useEffect, useMemo, useState } from "react";

type MediaState = {
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  ready: boolean;
};

const DESKTOP_QUERY = "(min-width: 1024px)";
const TABLET_QUERY = "(min-width: 640px) and (max-width: 1023px)";
const MOBILE_QUERY = "(max-width: 639px)";

function getMatches(): Omit<MediaState, "ready"> {
  if (typeof window === "undefined") {
    return {
      isDesktop: false,
      isTablet: false,
      isMobile: false,
    };
  }

  return {
    isDesktop: window.matchMedia(DESKTOP_QUERY).matches,
    isTablet: window.matchMedia(TABLET_QUERY).matches,
    isMobile: window.matchMedia(MOBILE_QUERY).matches,
  };
}

export function useMedia(): MediaState {
  const [state, setState] = useState<MediaState>(() => ({
    ...getMatches(),
    ready: typeof window !== "undefined",
  }));

  const queries = useMemo(
    () => [DESKTOP_QUERY, TABLET_QUERY, MOBILE_QUERY] as const,
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mqls = queries.map((query) => window.matchMedia(query));

    const update = () => {
      setState({
        ...getMatches(),
        ready: true,
      });
    };

    update();

    mqls.forEach((mql) => mql.addEventListener("change", update));

    return () => {
      mqls.forEach((mql) => mql.removeEventListener("change", update));
    };
  }, [queries]);

  return state;
}
