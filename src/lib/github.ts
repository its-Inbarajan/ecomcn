import { REPO_URL } from "@/lib/site";

const API_URL = REPO_URL.replace("https://github.com/", "https://api.github.com/repos/");

/**
 * The repo's star count, fetched on the server and cached for an hour, so
 * pages stay static and no visitor's browser calls the GitHub API (its
 * unauthenticated limit is 60 requests an hour per IP). Null when GitHub is
 * down or rate-limited — the header then shows the link without a count.
 */
export async function getRepoStars(): Promise<number | null> {
  try {
    const response = await fetch(API_URL, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const repo: { stargazers_count?: unknown } = await response.json();
    return typeof repo.stargazers_count === "number" ? repo.stargazers_count : null;
  } catch {
    return null;
  }
}
