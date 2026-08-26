import { resolve } from 'node:path';
import { serveVerifiedBuild, verifyAndFreezeBuild } from './verified-launcher.mjs';

const expectedManifestSha256 = process.env.EXPECTED_MANIFEST_SHA256;
const expectedGitSha = process.env.EXPECTED_GIT_SHA;
if (!expectedManifestSha256 || !expectedGitSha) throw new Error('External EXPECTED_MANIFEST_SHA256 and EXPECTED_GIT_SHA are required');
const frozen = verifyAndFreezeBuild({ source: resolve('dist'), expectedManifestSha256, expectedGitSha, destinationParent: resolve('.verified-builds') });
const port = Number(process.env.PORT ?? 5292);
serveVerifiedBuild(frozen.directory, frozen.receipt, port);
process.stdout.write(`${JSON.stringify({ url: `http://127.0.0.1:${port}`, receipt: frozen.receipt })}\n`);
