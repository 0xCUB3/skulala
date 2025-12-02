"use client";

import type { ReactNode } from "react";

interface SmoothScrollProviderProps {
  children: ReactNode;
}

// Using native scrolling to preserve macOS/iOS rubber band bounce effect.
// Lenis overrides native scroll and prevents the bounce, so we rely on
// CSS-based smooth scrolling which keeps the native springy feel at edges.
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return <>{children}</>;
}
