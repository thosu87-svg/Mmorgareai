'use client';
/**
 * @fileOverview Axiom Frontier - Asset URL Resolution Service
 * Enhanced to handle Firebase Storage paths (gs:// or relative storage paths).
 */

import { storage_get_object_download_url } from '@/firebase/storage';

export type AssetCategory = 'models' | 'animations' | 'textures' | 'audio';

const LOCAL_DIRS: Record<AssetCategory, string> = {
  models: '/assets/models',
  animations: '/assets/animations',
  textures: '/assets/textures',
  audio: '/assets/audio',
};

/**
 * Resolves a URL or storage path to a usable download URL.
 */
export async function resolveAssetUrl(
  pathOrUrl: string | null | undefined, 
  category: AssetCategory
): Promise<string | undefined> {
  if (!pathOrUrl) return undefined;

  // 1. Handle Full HTTP URLs
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }

  // 2. Handle Local Assets (starting with /)
  if (pathOrUrl.startsWith('/')) {
    return pathOrUrl;
  }

  // 3. Handle Firebase Storage paths (gs:// or identified storage relative paths)
  // If it's a relative path that doesn't look like a local asset, assume it's Firebase Storage
  if (pathOrUrl.startsWith('gs://') || (!pathOrUrl.includes('/') && pathOrUrl.includes('.'))) {
    try {
      const storagePath = pathOrUrl.replace('gs://', '');
      return await storage_get_object_download_url(storagePath);
    } catch (e) {
      console.warn(`[RESOLVER_WARN] Storage resolution failed for ${pathOrUrl}, falling back to local.`);
    }
  }

  // 4. Default to local directory based on category
  const filename = pathOrUrl.split('/').pop();
  if (!filename) return pathOrUrl;

  return `${LOCAL_DIRS[category]}/${filename}`;
}

/**
 * Legacy support for synchronous local resolution (will not work for cloud storage).
 */
export function resolveToLocal(url: string | null | undefined, category: AssetCategory): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/assets/') || url.startsWith('./') || url.startsWith('../')) return url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return url;

  const filename = url.split('/').pop();
  if (!filename) return url;

  return `${LOCAL_DIRS[category]}/${filename}`;
}
