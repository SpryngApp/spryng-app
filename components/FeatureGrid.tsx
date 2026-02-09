function Feature({title, body, bullets}:{title:string; body:string; bullets:string[]}) {
  return (
    <div className="card p-6">
      <h3>{title}</h3>
      <p className="mt-2">{body}</p>
      <ul className="mt-4 list-disc ml-5 text-brand-ink/80 space-y-1">
        {bullets.map(b => <li key={b}>{b}</li>)}
      </ul>
    </div>
  );
}
export default function FeatureGrid(){
  return (
    <section id="features" className="py-10">
      <div className="container">
        <div className="card p-4 flex flex-wrap items-center justify-between text-sm">
          <div>Plain-language guidance • Industry-aware suggestions • Compliance hints</div>
          <div className="text-xs text-slate-500">Educational use only.</div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <Feature title="The Calm Ledger" body="Inline memos, split & tag, and AI that explains every step." bullets={["Human categories","Smart search","Explain-as-you-go"]} />
          <Feature title="Orbit Dashboard" body="Beautiful rings show where money flows, plus a Clarity Score that grows." bullets={["Category rings","Insight cards","Progress glow"]} />
          <Feature title="Light Compliance" body="Gentle flags for W-9s, COIs, and contractor patterns—stay ready without panic." bullets={["Risk hints","Plain-language reasons","Export for your CPA"]} />
        </div>
      </div>
    </section>
  );
}
