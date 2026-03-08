
"use client";

import { GitHubSyncConfig } from "@/store";

export class GitHubSyncService {
  /**
   * Pushes a single file to GitHub using the contents API.
   * Uses robust UTF-8 to Base64 encoding to prevent "Invalid Content" errors.
   */
  private static async pushFile(config: GitHubSyncConfig, path: string, content: string, message: string) {
    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`;
    
    console.log(`[GITHUB_SYNC] Syncing file: ${path} to ${config.owner}/${config.repo} on branch ${config.branch}`);
    
    let sha: string | undefined;
    try {
      const getRes = await fetch(`${url}?ref=${config.branch}`, {
        headers: {
          'Authorization': `token ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        cache: 'no-store'
      });
      if (getRes.ok) {
        const data = await getRes.json();
        sha = data.sha;
      }
    } catch (e) {
      console.warn(`[GITHUB_SYNC] SHA fetch skipped for ${path} (likely new file)`);
    }

    // High-fidelity UTF-8 base64 encoding for the browser environment
    const base64Content = btoa(encodeURIComponent(content).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
    }));

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${config.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        message,
        content: base64Content,
        branch: config.branch,
        sha
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`[GITHUB_PROTOCOL_ERROR] ${path} failed with status ${res.status}:`, err);
      throw new Error(err.message || `GitHub API Status: ${res.status}`);
    }
    
    console.log(`[GITHUB_SYNC_SUCCESS] ${path} committed.`);
  }

  /**
   * Pushes a batch of files as a comprehensive simulation snapshot.
   */
  static async pushSnapshot(config: GitHubSyncConfig, files: Record<string, string>) {
    const timestamp = new Date().toISOString();
    const message = `[OUROBOROS_SYNC] Matrix State Snapshot: ${timestamp}`;
    
    const errors: string[] = [];
    const results: string[] = [];

    for (const [path, content] of Object.entries(files)) {
      try {
        await this.pushFile(config, path, content, message);
        results.push(path);
      } catch (e: any) {
        errors.push(`${path}: ${e.message}`);
      }
    }

    return { results, errors };
  }
}
