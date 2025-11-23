export type Incident = {
  id: string | number;
  title?: string;
  // flexible time representation: prefer `time_start`/`time_end`, fallback to `time`
  time?: string; // ISO string or epoch string/number
  time_start?: string;
  time_end?: string;
  transportMean?: string;
  subdivision?: string;
  relevance?: string | number;
  type?: string;
  constraints?: string[];
  [k: string]: any;
};

export type TimeRange = {
  start: string; // ISO
  end: string; // ISO
};

export type FinalReport = {
  transportationMean: string | null;
  subdivision: string | null;
  relevance: string | number | null;
  frequency: number;
  type: string | null;
  timeRange: TimeRange;
  constraints: string[]; // aggregated unique constraints
  incidentIds: Array<string | number>;
};

function toDate(value?: string | number | null): Date | null {
  if (value == null) return null;
  const n = Number(value);
  // If numeric string or number and reasonable, treat as epoch
  if (!Number.isNaN(n) && String(value).length >= 10 && String(value).length <= 13) {
    // assume milliseconds when length 13, seconds when 10
    return new Date(String(value).length === 10 ? n * 1000 : n);
  }
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? null : d;
}

function iso(d: Date) {
  return d.toISOString();
}

// Normalize an incident to have start/end Date objects. If only a single time is present,
// create a small window around it (default +/- 30 minutes).
export type NormalizedIncident = Incident & {
  _start: Date | null;
  _end: Date | null;
};

export function normalizeIncident(i: Incident, windowMs = 30 * 60 * 1000): NormalizedIncident {
  const start = toDate(i.time_start ?? i.time);
  const end = toDate(i.time_end ?? i.time);

  if (start && end) {
    return { ...i, _start: start, _end: end };
  }

  if (start && !end) {
    return { ...i, _start: new Date(start.getTime() - windowMs / 2), _end: new Date(start.getTime() + windowMs / 2) };
  }

  if (!start && end) {
    return { ...i, _start: new Date(end.getTime() - windowMs / 2), _end: new Date(end.getTime() + windowMs / 2) };
  }

  // no times: leave nulls
  return { ...i, _start: null, _end: null };
}

// Group incidents into FinalReport objects.
// Grouping strategy:
// 1) Bucket by transportMean, subdivision, relevance, type
// 2) Within each bucket, sort by start time and merge items whose time windows overlap
//    or are within `timeGapMs` of each other. Incidents without time are grouped together
//    per bucket but produce a wide "unknown" timeRange covering nothing (both start/end null -> current ISO)
export function groupIncidents(incidents: Incident[], opts?: { windowMs?: number; timeGapMs?: number }): FinalReport[] {
  const windowMs = opts?.windowMs ?? 30 * 60 * 1000;
  const timeGapMs = opts?.timeGapMs ?? 60 * 60 * 1000; // 1 hour default merge gap

  const normalized = incidents.map((i) => normalizeIncident(i, windowMs));

  const buckets = new Map<string, NormalizedIncident[]>();

  for (const inc of normalized) {
    const key = `${inc.transportMean ?? 'UNKNOWN'}||${inc.subdivision ?? 'UNKNOWN'}||${inc.relevance ?? 'UNKNOWN'}||${inc.type ?? 'UNKNOWN'}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(inc);
  }

  const reports: FinalReport[] = [];

  for (const [key, bucket] of buckets) {
    // sort by start date, putting nulls at the end
    bucket.sort((a, b) => {
      if (!a._start && !b._start) return 0;
      if (!a._start) return 1;
      if (!b._start) return -1;
      return a._start.getTime() - b._start.getTime();
    });

    let current: { start: Date | null; end: Date | null; ids: Array<string | number>; constraints: Set<string>; count: number } | null = null;

    const flushCurrent = () => {
      if (!current) return;
      const [transportationMean, subdivision, relevance, type] = key.split('||');
      const startIso = current.start ? iso(current.start) : new Date().toISOString();
      const endIso = current.end ? iso(current.end) : new Date().toISOString();

      reports.push({
        transportationMean: transportationMean === 'UNKNOWN' ? null : transportationMean,
        subdivision: subdivision === 'UNKNOWN' ? null : subdivision,
        relevance: relevance === 'UNKNOWN' ? null : (isNaN(Number(relevance)) ? relevance : Number(relevance)),
        frequency: current.count,
        type: type === 'UNKNOWN' ? null : type,
        timeRange: { start: startIso, end: endIso },
        constraints: Array.from(current.constraints),
        incidentIds: current.ids,
      });

      current = null;
    };

    for (const inc of bucket) {
      const s = inc._start;
      const e = inc._end;

      if (!current) {
        current = { start: s, end: e, ids: [inc.id], constraints: new Set(inc.constraints ?? []), count: 1 };
        continue;
      }

      // If both have no times, aggregate into same group
      if (!current.start && !s) {
        current.ids.push(inc.id);
        (inc.constraints ?? []).forEach((c) => current!.constraints.add(c));
        current.count += 1;
        continue;
      }

      // If either side is missing time, treat as non-overlapping (keep separate group)
      if (!current.end || !s) {
        flushCurrent();
        current = { start: s, end: e, ids: [inc.id], constraints: new Set(inc.constraints ?? []), count: 1 };
        continue;
      }

      // check overlap or gap within timeGapMs
      const gap = s.getTime() - current.end.getTime();
      if (gap <= timeGapMs) {
        // merge
        current.end = new Date(Math.max(current.end.getTime(), e ? e.getTime() : current.end.getTime()));
        if (s && (!current.start || s.getTime() < current.start.getTime())) current.start = s;
        current.ids.push(inc.id);
        (inc.constraints ?? []).forEach((c) => current!.constraints.add(c));
        current.count += 1;
      } else {
        // start a new group
        flushCurrent();
        current = { start: s, end: e, ids: [inc.id], constraints: new Set(inc.constraints ?? []), count: 1 };
      }
    }

    flushCurrent();
  }

  return reports;
}

export default groupIncidents;
