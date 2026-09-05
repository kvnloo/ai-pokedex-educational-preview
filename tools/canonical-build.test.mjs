import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

for (const mode of ['production', 'private-local']) {
  for (const defect of ['schema', 'chronology', 'topology']) {
    test(`direct Vite ${mode} build rejects ${defect} drift before bundling`, () => {
      // Only disposable fixtures live in tmp; test logs/evidence are captured
      // by the caller. Never mutate the real canonical corpus to test rejection.
      const fixture = mkdtempSync(join(tmpdir(), 'twilight-canonical-build-'));
      try {
        for (const file of ['canonical', 'vite.config.ts', 'package.json']) {
          cpSync(join(root, file), join(fixture, file), { recursive: true });
        }
        mkdirSync(join(fixture, 'tools'));
        cpSync(join(root, 'tools/private-opening'), join(fixture, 'tools/private-opening'), { recursive: true });
        for (const file of ['canonical-world-golden.mjs', 'canonical-world-validation.mjs']) {
          cpSync(join(root, 'tools', file), join(fixture, 'tools', file));
        }
        mkdirSync(join(fixture, 'src/world'), { recursive: true });
        cpSync(join(root, 'src/world/canonicalWorld.ts'), join(fixture, 'src/world/canonicalWorld.ts'));
        symlinkSync(join(root, 'node_modules'), join(fixture, 'node_modules'), 'dir');
        writeFileSync(join(fixture, 'index.html'), '<p>Build gate fixture</p>');
        const file = join(fixture, defect === 'topology' ? 'canonical/runtime/kanto-opening.json' : 'canonical/ash/events/kanto-opening.json');
        const document = JSON.parse(readFileSync(file, 'utf8'));
        if (defect === 'schema') delete document.events[0].provenance.sourceId;
        else if (defect === 'chronology') document.events[1].order = document.events[0].order;
        else [document.path[1], document.path[4]] = [document.path[4], document.path[1]];
        writeFileSync(file, JSON.stringify(document));
        const result = spawnSync(process.execPath, [join(root, 'node_modules/vite/bin/vite.js'), 'build', '--mode', mode], {
          cwd: fixture, encoding: 'utf8', timeout: 30_000,
        });
        assert.ifError(result.error);
        assert.notEqual(result.status, 0, 'malformed canonical content must fail the real build');
        const output = result.stdout + result.stderr;
        assert.match(output, /canonical-acceptance-gate/);
        assert.match(output, {
          schema: /required property 'sourceId'/,
          chronology: /duplicate Ash event order/,
          topology: /runtime.path transition/,
        }[defect]);
        assert.doesNotMatch(output, /built in/);
      } finally {
        rmSync(fixture, { recursive: true, force: true });
      }
    });
  }
}
