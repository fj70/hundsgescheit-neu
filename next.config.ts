import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Eindeutiger Workspace-Root (es liegen mehrere Lockfiles im Elternverzeichnis).
  turbopack: { root: __dirname },
  // Fuer Docker/Coolify: schlanker Standalone-Output.
  output: "standalone",
};

export default nextConfig;
