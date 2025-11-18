const benefits = [
  { title: "Mobile-first", desc: "Optimized for phones with a native-like navigation" },
  { title: "Fast & Lightweight", desc: "Built with Vite, React, and Tailwind for speed" },
  { title: "Insight Ready", desc: "Track popular items and customer behavior (coming soon)" },
  { title: "Easy Setup", desc: "No coding required — deploy and start in minutes" },
];

export function BenefitsGrid() {
  return (
    <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {benefits.map((b, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
          <h3 className="font-medium">{b.title}</h3>
          <p className="text-sm text-muted-foreground">{b.desc}</p>
        </div>
      ))}
    </section>
  );
}