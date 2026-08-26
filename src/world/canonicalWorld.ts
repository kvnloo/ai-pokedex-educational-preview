import mapsDocument from '../../canonical/maps/kanto-opening.json' with { type: 'json' };
import eventsDocument from '../../canonical/ash/events/kanto-opening.json' with { type: 'json' };
import runtimeDocument from '../../canonical/runtime/kanto-opening.json' with { type: 'json' };

type Coordinate = [number, number];
type Connection = { to: string; offset: Coordinate };
type VersionedMap = {
  gameId: string;
  locationId: string;
  connections: Connection[];
};

/**
 * Derive world coordinates exclusively from normalized directional edges.
 * Conflicting coordinates fail closed instead of silently flattening versions.
 */
export function deriveCoordinates(
  maps: VersionedMap[],
  gameId: string,
  originId: string,
): Record<string, Coordinate> {
  const selected = maps.filter((map) => map.gameId === gameId);
  const byLocation = new Map(selected.map((map) => [map.locationId, map]));
  if (!byLocation.has(originId)) throw new Error(`Missing graph origin ${originId} for ${gameId}`);

  const coordinates: Record<string, Coordinate> = { [originId]: [0, 0] };
  const queue = [originId];
  while (queue.length > 0) {
    const from = queue.shift()!;
    const source = byLocation.get(from);
    if (!source) throw new Error(`Connection references missing source ${from}`);
    const [x, y] = coordinates[from]!;
    for (const edge of source.connections) {
      if (!byLocation.has(edge.to)) throw new Error(`Connection references missing target ${edge.to}`);
      const candidate: Coordinate = [x + edge.offset[0], y + edge.offset[1]];
      const prior = coordinates[edge.to];
      if (prior && (prior[0] !== candidate[0] || prior[1] !== candidate[1])) {
        throw new Error(`Conflicting graph coordinate for ${edge.to}`);
      }
      if (!prior) {
        coordinates[edge.to] = candidate;
        queue.push(edge.to);
      }
    }
  }
  if (Object.keys(coordinates).length !== selected.length) {
    throw new Error(`Disconnected ${gameId} graph: reached ${Object.keys(coordinates).length}/${selected.length}`);
  }
  return coordinates;
}

const path = runtimeDocument.path;
const coordinates = deriveCoordinates(
  mapsDocument.maps as unknown as VersionedMap[],
  runtimeDocument.activeGameId,
  path[0]!,
);

export const canonicalKantoOpening = Object.freeze({
  sliceId: runtimeDocument.sliceId,
  activeGameId: runtimeDocument.activeGameId,
  path,
  coordinates,
  events: [...eventsDocument.events].sort((a, b) => a.order - b.order),
  presentationPolicy: runtimeDocument.presentationPolicy,
});
