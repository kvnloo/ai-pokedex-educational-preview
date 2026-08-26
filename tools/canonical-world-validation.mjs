const opposite = { north: 'south', south: 'north', east: 'west', west: 'east' };
const fail = (message) => { throw new Error(`canonical integrity: ${message}`); };
const requireRef = (set, id, label) => { if (!set.has(id)) fail(`${label} references missing ${id}`); };

export function validateCanonicalCorpus(corpus) {
  const collections = [
    ['sources', corpus.sources.sources], ['games', corpus.games.games],
    ['regions', corpus.regions.regions], ['locations', corpus.locations.locations],
    ['maps', corpus.maps.maps], ['arcs', corpus.arcs.arcs],
    ['events', corpus.events.events], ['divergences', corpus.conflicts.divergences],
  ];
  const globalIds = new Set();
  for (const [name, items] of collections) {
    const ids = new Set();
    for (const item of items) {
      if (ids.has(item.id)) fail(`duplicate ${name} id ${item.id}`);
      if (globalIds.has(item.id)) fail(`globally duplicate id ${item.id}`);
      ids.add(item.id); globalIds.add(item.id);
    }
  }

  const sourceIds = new Set(corpus.sources.sources.map((x) => x.id));
  const gameIds = new Set(corpus.games.games.map((x) => x.id));
  const regionIds = new Set(corpus.regions.regions.map((x) => x.id));
  const locationIds = new Set(corpus.locations.locations.map((x) => x.id));
  const arcIds = new Set(corpus.arcs.arcs.map((x) => x.id));
  const mapsById = new Map(corpus.maps.maps.map((x) => [x.id, x]));
  const mapsByGameLocation = new Map(corpus.maps.maps.map((x) => [`${x.gameId}\0${x.locationId}`, x]));
  const nestedIds = new Set();

  const visitProvenance = (value, path) => {
    if (!value || typeof value !== 'object') return;
    if (value.provenance && typeof value.provenance === 'object') {
      requireRef(sourceIds, value.provenance.sourceId, `${path}.provenance.sourceId`);
    }
    if (Array.isArray(value)) value.forEach((item, index) => visitProvenance(item, `${path}[${index}]`));
    else for (const [key, child] of Object.entries(value)) {
      if (key !== 'provenance') visitProvenance(child, `${path}.${key}`);
    }
  };
  for (const [name, document] of Object.entries(corpus)) visitProvenance(document, name);

  for (const region of corpus.regions.regions) for (const id of region.gameIds) requireRef(gameIds, id, region.id);
  for (const location of corpus.locations.locations) requireRef(regionIds, location.regionId, location.id);
  for (const arc of corpus.arcs.arcs) requireRef(regionIds, arc.regionId, arc.id);
  for (const event of corpus.events.events) {
    requireRef(arcIds, event.arcId, event.id);
    requireRef(locationIds, event.locationId, event.id);
  }

  for (const map of corpus.maps.maps) {
    requireRef(gameIds, map.gameId, map.id);
    requireRef(locationIds, map.locationId, map.id);
    for (const item of [...map.connections, ...map.warps]) {
      if (globalIds.has(item.id) || nestedIds.has(item.id)) fail(`globally duplicate id ${item.id}`);
      nestedIds.add(item.id);
    }
    for (const edge of map.connections) {
      requireRef(locationIds, edge.to, edge.id);
      const target = mapsByGameLocation.get(`${map.gameId}\0${edge.to}`);
      if (!target) fail(`${edge.id} has no target map in ${map.gameId}`);
      const reverses = target.connections.filter((x) => x.to === map.locationId);
      if (edge.oneWay) {
        if (reverses.length) fail(`${edge.id} is one-way but retains reciprocal edge`);
      } else {
        const reverse = reverses.find((x) => !x.oneWay);
        if (!reverse) fail(`${edge.id} lacks reciprocal edge`);
        if (reverse.direction !== opposite[edge.direction]) fail(`${edge.id} reciprocal direction is not opposite`);
        if (reverse.offset[0] !== -edge.offset[0] || reverse.offset[1] !== -edge.offset[1]) fail(`${edge.id} reciprocal offset is not inverse`);
      }
    }
    for (const warp of map.warps) {
      const target = mapsById.get(warp.toMap);
      if (!target) fail(`${warp.id} references missing map ${warp.toMap}`);
      if (warp.oneWay) {
        if (warp.reciprocalWarpId !== null) fail(`${warp.id} is one-way but retains reciprocalWarpId`);
      } else {
        if (typeof warp.reciprocalWarpId !== 'string') fail(`${warp.id} requires reciprocalWarpId`);
        const reverse = target.warps.find((x) => x.id === warp.reciprocalWarpId);
        if (!reverse || reverse.oneWay || reverse.toMap !== map.id || reverse.reciprocalWarpId !== warp.id) fail(`${warp.id} reciprocal warp is invalid`);
      }
    }
  }

  const runtime = corpus.runtime;
  requireRef(regionIds, runtime.regionId, 'runtime.regionId');
  requireRef(gameIds, runtime.activeGameId, 'runtime.activeGameId');
  requireRef(arcIds, runtime.ashArcId, 'runtime.ashArcId');
  for (const id of runtime.path) {
    requireRef(locationIds, id, 'runtime.path');
    if (!mapsByGameLocation.has(`${runtime.activeGameId}\0${id}`)) fail(`runtime.path lacks active-game map ${id}`);
  }
  for (const id of Object.keys(runtime.coordinates)) requireRef(locationIds, id, 'runtime.coordinates');
  if (Object.keys(runtime.coordinates).length !== runtime.path.length || runtime.path.some((id) => !(id in runtime.coordinates))) fail('runtime coordinates and path differ');
  return true;
}
