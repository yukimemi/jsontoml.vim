// =============================================================================
// File        : main.ts
// Author      : yukimemi
// Last Change : 2024/07/28 21:08:07.
// =============================================================================

import * as TOML from "jsr:@std/toml@1.0.1";
import * as fn from "jsr:@denops/std@7.3.2/function";
import * as opt from "jsr:@denops/std@7.3.2/option";
import type { Denops } from "jsr:@denops/std@7.3.2";
import { assert, is } from "jsr:@core/unknownutil@4.3.0";

// from https://qiita.com/usoda/items/dbedc06fd4bf38a59c48
const stringifyReplacer = (_: unknown, v: unknown) =>
  (!(v instanceof Array || v === null) && typeof v == "object")
    ? Object.keys(v).sort().reduce((r, k) => {
      r[k] = (v as Record<string, unknown>)[k];
      return r;
    }, {} as Record<string, unknown>)
    : v;

export function main(denops: Denops) {
  denops.dispatcher = {
    async jsonTOML(start: unknown, end: unknown) {
      assert(start, is.Number);
      assert(end, is.Number);
      const lines = await fn.getline(denops, start, end);
      const obj = JSON.parse(lines.join(""));
      const toml = TOML.stringify(obj);
      await fn.appendbufline(denops, "%", end, toml.split("\n").slice(1));
      await fn.deletebufline(denops, "%", start, end);
      await opt.filetype.setLocal(denops, "toml");
    },
    async tomlJSON(start: unknown, end: unknown) {
      assert(start, is.Number);
      assert(end, is.Number);
      const lines = await fn.getline(denops, start, end);
      const obj = TOML.parse(lines.join("\n"));
      const json = JSON.stringify(obj, stringifyReplacer, 2);
      await fn.appendbufline(denops, "%", end, json.split("\n"));
      await fn.deletebufline(denops, "%", start, end);
      await opt.filetype.setLocal(denops, "json");
    },
  };
}
