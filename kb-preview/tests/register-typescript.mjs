import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import ts from 'typescript';

// Ubuntu's Node build does not include native TypeScript stripping. Transpile
// the unchanged fixture modules using the project's pinned TypeScript compiler.
registerHooks({
  load(url, context, nextLoad) {
    if (!url.startsWith('file:') || !url.endsWith('.ts')) return nextLoad(url, context);
    const result = ts.transpileModule(readFileSync(new URL(url), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      fileName: new URL(url).pathname,
    });
    return { format: 'module', source: result.outputText, shortCircuit: true };
  },
});
