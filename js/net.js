// Online rooms over Supabase: one row per room, optimistic version checks, Realtime push,
// polling fallback for flaky campus Wi-Fi, and a shared server clock for turn timers.
import { SUPABASE_URL, SUPABASE_KEY, SUPABASE_JS } from './config.js';

let clientPromise = null;
export function client() {
  if (!clientPromise) {
    clientPromise = import(SUPABASE_JS).then(m => m.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      realtime: { params: { eventsPerSecond: 20 } },
    }));
  }
  return clientPromise;
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function makeCode(len = 5) {
  const a = new Uint32Array(len);
  crypto.getRandomValues(a);
  return Array.from(a, x => ALPHABET[x % ALPHABET.length]).join('');
}
export const normaliseCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);

let clockOffset = 0;
export const serverNow = () => Date.now() + clockOffset;
export async function syncClock() {
  try {
    const sb = await client();
    const best = [];
    for (let i = 0; i < 3; i++) {
      const t0 = Date.now();
      const { data, error } = await sb.rpc('server_now');
      const t1 = Date.now();
      if (error || !data) continue;
      best.push({ rtt: t1 - t0, off: new Date(data).getTime() - (t0 + t1) / 2 });
    }
    if (best.length) clockOffset = best.sort((a, b) => a.rtt - b.rtt)[0].off;
  } catch { /* keep local clock */ }
  return clockOffset;
}

export async function createRoom(makeState) {
  const sb = await client();
  for (let i = 0; i < 6; i++) {
    const code = makeCode();
    const state = makeState(code);
    const { error } = await sb.from('rooms').insert({ code, state, version: 1 });
    if (!error) return { code, state, version: 1 };
    if (error.code !== '23505') throw new Error(error.message || 'Could not create room');
  }
  throw new Error('Could not allocate a room code — try again');
}

export async function fetchRoom(code) {
  const sb = await client();
  const { data, error } = await sb.from('rooms').select('state, version').eq('code', code).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export class Room {
  constructor(code, handlers) {
    this.code = code;
    this.h = handlers; // { onState(state, version), onPresence(list), onStatus(text) }
    this.state = null;
    this.version = 0;
    this.channel = null;
    this.status = 'connecting';
    this.pollTimer = null;
    this.queue = Promise.resolve();
  }

  apply(state, version) {
    if (version <= this.version) return;
    this.state = state;
    this.version = version;
    this.h.onState?.(state, version);
  }

  async refetch() {
    const row = await fetchRoom(this.code);
    if (!row) throw new Error('Room not found');
    this.apply(row.state, row.version);
    return row;
  }

  async connect(me) {
    const sb = await client();
    await this.refetch();
    this.channel = sb.channel(`room:${this.code}`, { config: { presence: { key: me.id } } })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${this.code}` }, (payload) => {
        const row = payload.new;
        if (row?.state && row.version) this.apply(row.state, row.version);
        else this.refetch().catch(() => {});
      })
      .on('presence', { event: 'sync' }, () => {
        const st = this.channel.presenceState();
        this.h.onPresence?.(Object.keys(st));
      })
      .subscribe(async (status) => {
        this.status = status;
        this.h.onStatus?.(status);
        if (status === 'SUBSCRIBED') {
          try { await this.channel.track({ id: me.id, name: me.name, at: Date.now() }); } catch { /* presence optional */ }
          this.refetch().catch(() => {});
        }
      });
    const poll = async () => {
      try {
        const { data } = await sb.from('rooms').select('version').eq('code', this.code).maybeSingle();
        if (data && data.version > this.version) await this.refetch();
      } catch { /* offline — try again */ }
      this.pollTimer = setTimeout(poll, this.status === 'SUBSCRIBED' ? 8000 : 2500);
    };
    this.pollTimer = setTimeout(poll, 3000);
    this.onVis = () => { if (document.visibilityState === 'visible') this.refetch().catch(() => {}); };
    document.addEventListener('visibilitychange', this.onVis);
  }

  // reducer(state) -> next state (may throw). Serialised per client; retried on version conflicts.
  dispatch(reducer) {
    const run = async () => {
      const sb = await client();
      for (let attempt = 0; attempt < 5; attempt++) {
        const cur = this.state, ver = this.version;
        const next = reducer(cur);
        const { data, error } = await sb.from('rooms')
          .update({ state: next, version: ver + 1 })
          .eq('code', this.code).eq('version', ver)
          .select('version');
        if (!error && data && data.length) { this.apply(next, ver + 1); return next; }
        if (error && !/version conflict/i.test(error.message || '')) throw new Error(error.message);
        await this.refetch();
      }
      throw new Error('The room is busy — please try again');
    };
    const p = this.queue.then(run, run);
    this.queue = p.catch(() => {});
    return p;
  }

  async close() {
    clearTimeout(this.pollTimer);
    if (this.onVis) document.removeEventListener('visibilitychange', this.onVis);
    try { const sb = await client(); if (this.channel) await sb.removeChannel(this.channel); } catch { /* ignore */ }
  }
}

export async function submitResult(summary) {
  try {
    const sb = await client();
    await sb.from('match_results').insert({ mode: summary.mode === 'online' ? 'online' : 'local', crews: summary.crews.length, duration_s: Math.min(86400, summary.durationS || 0), data: summary });
    return true;
  } catch { return false; }
}

export async function fetchResults(limit = 500) {
  const sb = await client();
  const { data, error } = await sb.from('match_results').select('created_at, mode, crews, duration_s, data').order('created_at', { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return data || [];
}
