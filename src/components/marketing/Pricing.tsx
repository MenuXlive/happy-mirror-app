import { Button } from "@/components/ui/button";

const tiers = [
  { name: "Starter", price: "Free", features: ["Basic QR menu", "Up to 50 items", "Community support"] },
  { name: "Pro", price: "₹499/mo", features: ["Unlimited items", "Custom branding", "Priority support"] },
  { name: "Business", price: "₹1,999/mo", features: ["Multi-location", "Advanced analytics", "SLA support"] },
];

export function Pricing() {
  return (
    <section className="mt-10 grid md:grid-cols-3 gap-4">
      {tiers.map((t) => (
        <div key={t.name} className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-baseline gap-2">
            <h3 className="font-semibold text-lg">{t.name}</h3>
            <span className="text-muted-foreground">{t.price}</span>
          </div>
          <ul className="text-sm space-y-1">
            {t.features.map((f) => (
              <li key={f} className="flex gap-2">
                <span>✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Button variant={t.name === "Pro" ? "default" : "outline"} className="w-full">Choose {t.name}</Button>
        </div>
      ))}
    </section>
  );
}