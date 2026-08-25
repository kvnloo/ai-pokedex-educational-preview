#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { createAuthoritativeBackendReplayEvidence } from '../src/backend/authoritativeReplay.ts';

const outputIndex = process.argv.indexOf('--out');
const outputPath = outputIndex >= 0 ? process.argv[outputIndex + 1] : undefined;
const evidence = await createAuthoritativeBackendReplayEvidence();
const serialized = `${JSON.stringify(evidence, null, 2)}\n`;
if (outputPath) writeFileSync(outputPath, serialized, { mode: 0o600 });
process.stdout.write(serialized);
