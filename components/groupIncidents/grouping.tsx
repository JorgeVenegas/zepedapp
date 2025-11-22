import { createClient } from '@/lib/supabase/server'
import groupIncidents, { type FinalReport, type Incident } from '@/lib/incidentGrouping'

export default async function GetIncidents() {
  const supabase = await createClient()

  // This fetch happens on the server
  const { data: incidents } = await supabase.from('incidentes').select()

  // incidents from Supabase are `any` typed — cast to our flexible `Incident` type
  const typedIncidents = (incidents ?? []) as Incident[]

  const reports: FinalReport[] = groupIncidents(typedIncidents)

  return (
    <section>
      <h3 className="sr-only">Grouped incidents</h3>
      <ul>
        {reports.map((r, idx) => (
          <li key={`${r.transportationMean ?? 'none'}-${r.subdivision ?? 'none'}-${idx}`}>
            <strong>{r.type ?? 'Type unknown'}</strong> — {r.transportationMean ?? 'Transport unknown'} ({r.frequency})
            <div>
              <small>{r.timeRange.start} → {r.timeRange.end}</small>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}





