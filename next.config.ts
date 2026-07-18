import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";

export default function createNextConfig(phase: string): NextConfig {
  const isDevServer = phase === PHASE_DEVELOPMENT_SERVER;
  const isProdBuild = phase === PHASE_PRODUCTION_BUILD;

  return {
    reactStrictMode: true,
    // Keep dev and production build artifacts isolated so stale chunks
    // from one mode never corrupt the other.
    distDir: isDevServer ? ".next-dev" : isProdBuild ? ".next" : ".next",
  };
}
