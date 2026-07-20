"use client";

import AppShell from "../components/AppShell";

const sampleSummary = [
  { label: "Active clients", value: "24", context: "Sample data", tone: "info" },
  { label: "Needs attention", value: "6", context: "Sample data", tone: "warning" },
  { label: "Milestones this week", value: "9", context: "Sample data", tone: "success" },
  { label: "Awaiting documents", value: "4", context: "Sample data", tone: "neutral" },
];

const sampleClients = [
  { id: "SAMPLE-1042", name: "Sample claimant A", stage: "Evidence review", next: "Review uploaded records", updated: "Today", tone: "info" },
  { id: "SAMPLE-1038", name: "Sample claimant B", stage: "Action needed", next: "Request missing document", updated: "Yesterday", tone: "warning" },
  { id: "SAMPLE-1029", name: "Sample claimant C", stage: "Submitted", next: "Monitor status", updated: "2 days ago", tone: "success" },
  { id: "SAMPLE-1017", name: "Sample claimant D", stage: "Intake", next: "Complete eligibility review", updated: "3 days ago", tone: "neutral" },
];

const sampleStages = [
  { label: "Intake", count: 5, note: "Initial review" },
  { label: "Evidence", count: 8, note: "Records in progress" },
  { label: "Ready", count: 3, note: "Final quality check" },
  { label: "Submitted", count: 8, note: "Monitoring status" },
];

export default function DashboardPage({ viewState = "ready" }) {
  return (
    <AppShell>
      <header className="page-heading">
        <div><p className="eyebrow">Operations overview</p><h1>Today&apos;s claim activity is ready.</h1><p>Review attention items first, then move active claims toward their next documented step.</p></div>
        <div className="sample-label">UI structure / Sample data</div>
      </header>

      {viewState === "loading" ? <DashboardLoading /> : null}
      {viewState === "empty" ? <DashboardEmpty /> : null}
      {viewState === "error" ? <DashboardError /> : null}
      {viewState === "ready" ? <DashboardReady /> : null}
    </AppShell>
  );
}

function DashboardReady() {
  return <>
    <section className="summary-grid" aria-label="Claim summary">
      {sampleSummary.map((item) => <article className="summary-card" key={item.label}><span className={`status-dot ${item.tone}`} aria-hidden="true" /><p>{item.label}</p><strong>{item.value}</strong><small>{item.context}</small></article>)}
    </section>

    <section className="dashboard-grid">
      <article className="panel client-panel">
        <div className="panel-heading"><div><p className="eyebrow">Priority workspace</p><h2>Clients needing review</h2></div><a href="/clients">View all clients</a></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th scope="col">Client</th><th scope="col">Stage</th><th scope="col">Next action</th><th scope="col">Updated</th></tr></thead>
            <tbody>{sampleClients.map((client) => <tr key={client.id}><th scope="row"><a href={`/clients/${client.id}`}>{client.name}</a><small>{client.id}</small></th><td><span className={`status-badge ${client.tone}`}>{client.stage}</span></td><td>{client.next}</td><td>{client.updated}</td></tr>)}</tbody>
          </table>
        </div>
      </article>

      <aside className="panel next-panel" aria-labelledby="next-heading">
        <div className="panel-heading"><div><p className="eyebrow">Next best action</p><h2 id="next-heading">Start with attention items</h2></div></div>
        <p>Six sample records need a document request or review decision. Open the client list to confirm the source before taking action.</p>
        <a className="secondary-button" href="/clients?filter=attention">Review attention items</a>
        <div className="rule-note"><strong>Data rule</strong><span>Never infer a claim status from missing data. Show unknown and request verification.</span></div>
      </aside>
    </section>

    <section className="panel pipeline-panel">
      <div className="panel-heading"><div><p className="eyebrow">Claim pipeline</p><h2>Work by stage</h2></div><a href="/pipeline">Open pipeline</a></div>
      <div className="pipeline-grid">{sampleStages.map((stage, index) => <article key={stage.label}><span>0{index + 1}</span><div><p>{stage.label}</p><strong>{stage.count}</strong><small>{stage.note}</small></div></article>)}</div>
    </section>
  </>;
}

function DashboardLoading() {
  return <section className="state-panel loading-state" aria-live="polite" aria-busy="true">
    <div className="state-copy"><p className="eyebrow">Secure workspace</p><h2>Loading claim activity</h2><p>We are retrieving the latest authorized workspace data.</p></div>
    <div className="skeleton-grid" aria-hidden="true"><span /><span /><span /><span /></div>
    <div className="skeleton-table" aria-hidden="true"><span /><span /><span /><span /></div>
  </section>;
}

function DashboardEmpty() {
  return <section className="state-panel"><span className="state-mark" aria-hidden="true"><img src="/va-claims-edge-logo.png" width="1280" height="952" alt="" /></span><p className="eyebrow">Workspace ready</p><h2>No client activity yet</h2><p>Summary cards, client attention items, and pipeline stages will appear after the first authorized records are added.</p><a className="secondary-button" href="/clients">Open clients</a></section>;
}

function DashboardError() {
  return <section className="state-panel error" role="alert"><span className="state-mark" aria-hidden="true">!</span><p className="eyebrow">Protected session</p><h2>Claim activity could not be loaded</h2><p>Your session is still protected. Try again, and contact the system administrator if the problem continues.</p><button className="secondary-button" type="button" onClick={() => window.location.reload()}>Try again</button></section>;
}
