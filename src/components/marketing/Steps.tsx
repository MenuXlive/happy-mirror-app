const steps = [
  { title: "Print or Display", desc: "Click \"Print\" to print QR codes for each table, or \"Download\" to save as an image for digital display" },
  { title: "Place on Tables", desc: "Position the QR code on each table or at the bar entrance for easy customer access" },
  { title: "Customers Scan", desc: "Customers scan the code with their phone camera to instantly access the digital menu" },
  { title: "Browse & Order", desc: "Customers can browse items, add to cart, and place orders directly from their device" },
];

export function Steps() {
  return (
    <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
      {steps.map((s, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary grid place-items-center text-sm">{i + 1}</div>
          <h3 className="font-medium">{s.title}</h3>
          <p className="text-sm text-muted-foreground">{s.desc}</p>
        </div>
      ))}
    </section>
  );
}