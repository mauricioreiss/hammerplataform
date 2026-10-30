// Avatars live in the public "avatars" bucket as "<user id>.<lowercase extension>",
// the only object name the storage policy accepts.
const AVATAR_EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

const AVATAR_FILE_SUFFIX = /^\.[a-z0-9]+(\?t=\d+)?$/;

export function avatarExtensionFor(mimeType: string): string | null {
  return AVATAR_EXTENSION_BY_MIME_TYPE[mimeType] ?? null;
}

type OwnAvatarUrlCheck = {
  url: string;
  supabaseUrl: string;
  userId: string;
};

export function isOwnAvatarPublicUrl({
  url,
  supabaseUrl,
  userId,
}: OwnAvatarUrlCheck): boolean {
  const avatarObjectPrefix = buildAvatarObjectPrefix(supabaseUrl);
  if (!avatarObjectPrefix) return false;

  const ownAvatarPrefix = avatarObjectPrefix + userId;
  if (!url.startsWith(ownAvatarPrefix)) return false;

  return AVATAR_FILE_SUFFIX.test(url.slice(ownAvatarPrefix.length));
}

// Mirrors how supabase-js builds getPublicUrl, so the browser URL compares byte for byte.
function buildAvatarObjectPrefix(supabaseUrl: string): string | null {
  const trimmedUrl = supabaseUrl.trim();
  if (!/^https?:\/\//i.test(trimmedUrl)) return null;

  const baseUrl = trimmedUrl.endsWith("/") ? trimmedUrl : `${trimmedUrl}/`;
  try {
    return new URL("storage/v1/object/public/avatars/", baseUrl).href;
  } catch {
    return null;
  }
}
