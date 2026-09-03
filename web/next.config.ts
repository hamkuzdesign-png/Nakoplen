import type { NextConfig } from "next";

/* GitHub Pages build only — static-exports the whole app under /Nakoplen/
   (see .github/workflows/deploy-pages.yml). The local dev server and the
   `npm run build && npm start` ngrok production server never set this, so
   they keep working as a normal Next.js server build at the root path. */
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/Nakoplen" : "";

const nextConfig: NextConfig = {
  ...(isGithubPages ? { output: "export" as const } : {}),
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
};

export default nextConfig;
