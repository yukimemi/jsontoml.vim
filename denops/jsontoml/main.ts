import * as TOML from "https://deno.land/std@0.218.2/toml/mod.ts";
import * as fn from "https://deno.land/x/denops_std@v6.3.0/function/mod.ts";
import * as opt from "https://deno.land/x/denops_std@v6.3.0/option/mod.ts";
import type { Denops } from "https://deno.land/x/denops_std@v6.3.0/mod.ts";
import { assert, is } from "https://deno.land/x/unknownutil@v3.17.0/mod.ts";

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
