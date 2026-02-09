type Card = { icon?: string; title:string; body:string; bullets:string[] };
const cards: Card[] = [
  { title:"Bakery & Food Makers", body:"From flour to profit—track COGS and waste without the headache.", bullets:["Flour & yeast","Ovens & smallwares","Packaging","DoorDash/Toast fees"] },
  { title:"Cleaning & Janitorial", body:"Supplies, crews, mileage—know your true job costs.", bullets:["Disinfectant & rags","Client site supplies","Contractor payouts","Gas & mileage"] },
  { title:"Home Health / Care", body:"Track caregiver hours, compliance docs, and payer refunds.", bullets:["Caregiver payouts","Background checks","Liability insurance","EMR software"] },
  { title:"Trades & Construction", body:"Materials, subs, COIs—keep margins clean on every job.", bullets:["Lumber & fixtures","Dump fees","Subcontractors","Permits"] },
  { title:"Beauty & Personal Care", body:"Inventory, chair rent, bookings—make every service count.", bullets:["Products","Supplies","Booking fees","Chair/studio rent"] },
];

export default function Industries(){
  return (
    <section id="industries" className="py-12">
      <div className="container">
        <h2 className="mb-2">Built for real businesses</h2>
        <p>Elevyn speaks your language—from costs and refunds to compliance—without the jargon.</p>
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {cards.map(c=>(
            <div key={c.title} className="card p-6">
              <h3 className="text-xl">{c.title}</h3>
              <p className="mt-2">{c.body}</p>
              <div className="mt-3 text-sm text-slate-500">We recognize:</div>
              <ul className="mt-2 list-disc ml-5 text-brand-ink/80 space-y-1">
                {c.bullets.map(b=><li key={b}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-sm text-slate-600 mt-6">Don’t see your industry? <a className="underline" href="#">Tell us</a> and we’ll tune Elevyn to your workflow.</p>
      </div>
    </section>
  );
}
