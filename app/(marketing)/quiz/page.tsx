// app/(public)/quiz/page.tsx
import QuizFlow from "@/components/quiz/QuizFlow.client";

export const metadata = {
  title: "Spryng Quiz",
};

export default function QuizPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <div className="mb-6 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-600">Spryng</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Outside-payroll employer check
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              A fast, guided check based on your state’s expectations — with clear next steps.
            </p>
          </div>
        </div>

        <QuizFlow />
      </div>
    </main>
  );
}
