/**
 * Zero-allocation-ish typed event bus (COD lineage).
 * Systems talk here — not by grabbing each other's guts.
 */
export interface GameEvents {
  'game:ready': void;
  'game:mode': { mode: 'boot' | 'starter' | 'explore' | 'battle' | 'heal' };
  'game:notify': { text: string; kind?: 'info' | 'warn' | 'reward' };

  'starter:chosen': { speciesId: string };

  'overworld:enter-grass': { zoneId: string };
  'overworld:heal': void;
  'overworld:step': { x: number; z: number };

  'encounter:start': { speciesId: string; level: number };
  'encounter:end': { result: 'win' | 'lose' | 'flee' | 'catch' };

  'battle:start': { player: string; foe: string };
  'battle:move': { side: 'player' | 'foe'; moveId: string; name: string };
  'battle:damage': {
    side: 'player' | 'foe';
    amount: number;
    effectiveness: number;
    fainted: boolean;
  };
  'battle:faint': { side: 'player' | 'foe' };
  'battle:end': { winner: 'player' | 'foe' | 'draw' };

  'catch:attempt': { ballId: string };
  'catch:shake': { index: number; locked: boolean };
  'catch:result': { caught: boolean };

  'party:changed': { size: number };
  'ui:message': { text: string };
}

export type EventKey = keyof GameEvents;
type Handler<K extends EventKey> = (payload: GameEvents[K]) => void;

export class EventBus {
  private map = new Map<EventKey, Set<Handler<never>>>();

  on<K extends EventKey>(key: K, fn: Handler<K>): () => void {
    let set = this.map.get(key);
    if (!set) {
      set = new Set();
      this.map.set(key, set);
    }
    set.add(fn as Handler<never>);
    return () => {
      set!.delete(fn as Handler<never>);
    };
  }

  once<K extends EventKey>(key: K, fn: Handler<K>): () => void {
    const off = this.on(key, (p) => {
      off();
      fn(p);
    });
    return off;
  }

  emit<K extends EventKey>(key: K, payload: GameEvents[K]): void {
    const set = this.map.get(key);
    if (!set) return;
    for (const fn of set) (fn as Handler<K>)(payload);
  }

  clear(): void {
    this.map.clear();
  }
}

export const bus = new EventBus();
