export type ServedBuildManifest = {
  git: { sha: string; dirty: boolean };
  files: Record<string, { sha256: string; bytes: number }>;
};

function hex(bytes: ArrayBuffer): string {
  return [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

export async function verifyServedBuild(
  manifest: ServedBuildManifest,
  compiledGitSha: string,
  load: (path: string) => Promise<ArrayBuffer>,
): Promise<void> {
  if (manifest.git.sha !== compiledGitSha) throw new Error('compiled Git SHA mismatch');
  if (manifest.git.dirty) throw new Error('dirty build cannot be certified');
  await Promise.all(Object.entries(manifest.files).map(async ([path, expected]) => {
    const bytes = await load(path);
    if (bytes.byteLength !== expected.bytes) throw new Error(`served byte mismatch: ${path}`);
    const actual = hex(await crypto.subtle.digest('SHA-256', bytes));
    if (actual !== expected.sha256) throw new Error(`served byte mismatch: ${path}`);
  }));
}

export async function verifyServedBuildFromNetwork(
  manifest: ServedBuildManifest,
  compiledGitSha: string,
  baseUrl = document.baseURI,
): Promise<void> {
  await verifyServedBuild(manifest, compiledGitSha, async (path) => {
    const response = await fetch(new URL(path, baseUrl), { cache: 'no-store', integrity: `sha256-${hexToBase64(manifest.files[path]!.sha256)}` });
    if (!response.ok) throw new Error(`served build file unavailable: ${path} (${response.status})`);
    return response.arrayBuffer();
  });
}

function hexToBase64(value: string): string {
  const bytes = value.match(/.{2}/g)?.map((pair) => Number.parseInt(pair, 16)) ?? [];
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
