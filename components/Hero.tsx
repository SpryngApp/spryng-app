import Link from "next/link";

export default function Hero(){
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60rem_35rem_at_85%_-10%,#DCF2EE_0%,transparent_60%)]" />
      <div className="container grid md:grid-cols-2 gap-12 items-center pt-16 pb-12">
        <div>
          <h1>Clarity looks good on you.</h1>
          <p className="mt-4 text-lg max-w-xl">
            Turn transactions into understanding—friendly categories, gentle AI, and a dashboard that actually teaches.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/(auth)/signup" className="btn btn-primary">Start your money story</Link>
            <Link href="/(app)/dashboard" className="btn btn-ghost">See the product</Link>
          </div>
          <small className="mt-3 block">No spreadsheets. No guilt. Just growth.</small>
        </div>
        <div className="flex justify-center">
          <div className="rounded-2xl border shadow-soft bg-white p-5">
            {/* Placeholder for Orbit viz thumbnail */}
            <div className="h-[340px] w-[340px] rounded-full bg-[conic-gradient(#00AFAA_0_25%,#F88E6A_25%_45%,#94a3b8_45%_60%,#14b8a6_60%_85%,#e2e8f0_85%_100%)] grid place-items-center">
              <div className="w-40 h-40 rounded-full bg-white grid place-items-center shadow-card">
                <div className="text-center">
                  <div className="text-3xl font-semibold">82</div>
                  <div className="text-xs text-slate-500">Clarity Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
