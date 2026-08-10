type AppOriginEnvironment = {
  nodeEnv: string | undefined;
  siteUrl: string | undefined;
  vercelEnv: string | undefined;
  vercelBranchUrl?: string | undefined;
  vercelUrl: string | undefined;
};

function parseOrigin(value: string, variableName: string) {
  const candidate = value.includes("://") ? value : `https://${value}`;
  const url = new URL(candidate);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${variableName} must use http or https.`);
  }

  if (url.pathname !== "/" || url.search || url.hash || url.username || url.password) {
    throw new Error(`${variableName} must be an origin without a path, query, or credentials.`);
  }

  return url.origin;
}

export function resolveAppOrigin({ nodeEnv, siteUrl, vercelEnv, vercelBranchUrl, vercelUrl }: AppOriginEnvironment) {
  if (vercelEnv === "preview" && vercelBranchUrl?.trim()) {
    return parseOrigin(vercelBranchUrl.trim(), "VERCEL_BRANCH_URL");
  }

  if (vercelEnv === "preview" && vercelUrl?.trim()) {
    return parseOrigin(vercelUrl.trim(), "VERCEL_URL");
  }

  if (siteUrl?.trim()) return parseOrigin(siteUrl.trim(), "NEXT_PUBLIC_SITE_URL");

  if (nodeEnv === "development" || nodeEnv === "test") return "http://127.0.0.1:3000";

  throw new Error("Missing NEXT_PUBLIC_SITE_URL.");
}

export function getAppOrigin() {
  return resolveAppOrigin({
    nodeEnv: process.env.NODE_ENV,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    vercelEnv: process.env.VERCEL_ENV,
    vercelBranchUrl: process.env.VERCEL_BRANCH_URL,
    vercelUrl: process.env.VERCEL_URL,
  });
}
