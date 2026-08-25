/**
 * Normalize wave0 content rows into runtime MoveDef / species shapes.
 * Accepts either {id} or {slug,moveId} / {learnset} or {moves}.
 */

import type { MoveDef, SpeciesDef, TypeChart } from "./types.ts";
import { assertTypeChartComplete } from "./damage.ts";

export { assertTypeChartComplete };

/** Load-time gate: every listed type must have a full typeChart row/cells. */
export function validateShipTypeChart(
  chart: TypeChart,
  types: readonly string[],
): void {
  assertTypeChartComplete(chart, types);
}


export function normalizeMove(raw: Record<string, unknown>): MoveDef {
  const id = String(raw.id ?? raw.slug ?? "");
  if (!id) throw new Error("move missing id/slug");
  return {
    id,
    slug: typeof raw.slug === "string" ? raw.slug : id,
    moveId: typeof raw.moveId === "number" ? raw.moveId : undefined,
    name: String(raw.name ?? id),
    type: String(raw.type),
    category: raw.category as MoveDef["category"],
    power: (raw.power as number | null) ?? null,
    accuracy: (raw.accuracy as number | null) ?? null,
    pp: Number(raw.pp ?? 10),
    priority: Number(raw.priority ?? 0),
    target: typeof raw.target === "string" ? raw.target : undefined,
    effect: typeof raw.effect === "string" ? raw.effect : undefined,
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((tag): tag is "sound" | "contact" => tag === "sound" || tag === "contact")
      : undefined,
    description:
      typeof raw.description === "string" ? raw.description : undefined,
  };
}

export function normalizeSpecies(raw: Record<string, unknown>): SpeciesDef {
  const id = String(raw.id ?? raw.slug ?? "");
  if (!id) throw new Error("species missing id/slug");
  const learn =
    (raw.learnset as string[] | undefined) ??
    (raw.moves as string[] | undefined) ??
    [];
  const catchRate =
    typeof raw.catchRate === "number"
      ? raw.catchRate
      : typeof raw.captureRate === "number"
        ? raw.captureRate
        : undefined;
  const baseExp =
    typeof raw.baseExp === "number"
      ? raw.baseExp
      : typeof raw.baseExperience === "number"
        ? raw.baseExperience
        : undefined;
  return {
    id,
    slug: typeof raw.slug === "string" ? raw.slug : id,
    speciesId: typeof raw.speciesId === "number" ? raw.speciesId : undefined,
    name: String(raw.name ?? id),
    types: (raw.types as string[]).slice(),
    baseStats: raw.baseStats as SpeciesDef["baseStats"],
    moves: learn.slice(),
    role: typeof raw.role === "string" ? raw.role : undefined,
    color: typeof raw.color === "string" ? raw.color : undefined,
    flavor: typeof raw.flavor === "string" ? raw.flavor : undefined,
    catchRate,
    baseExp,
  };
}
