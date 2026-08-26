export type CanonicalBattlePrewarmEntry = {
  speciesId: string;
  scale: number;
  key: string;
};

type CanonicalBattleRoute = {
  starterChoices: readonly string[];
  wildEncounters: ReadonlyArray<{ species: string }>;
  gym?: { species: string } | null;
};

export function canonicalBattlePrewarmPlan(route: CanonicalBattleRoute): CanonicalBattlePrewarmEntry[] {
  const entries = new Map<string, CanonicalBattlePrewarmEntry>();
  const add = (speciesId: string, scale: number): void => {
    const key = `${speciesId}@${scale.toFixed(3)}`;
    entries.set(key, { speciesId, scale, key });
  };

  for (const speciesId of route.starterChoices) add(speciesId, 0.9);
  for (const encounter of route.wildEncounters) add(encounter.species, 1.02);
  if (route.gym) add(route.gym.species, 1.02);
  return [...entries.values()];
}
