import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Hero() {
  const navigate = useNavigate();
  return (
    <section className="text-center space-y-6 py-10">
      <div className="flex items-center justify-center gap-2">
        <Sparkles className="w-6 h-6 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold">
          MenuX — Modern QR Menus
        </h1>
      </div>
      <p className="text-muted-foreground max-w-xl mx-auto">
        Launch digital menus in minutes. Engage customers. Get insights.
      </p>
      <div className="flex gap-3 justify-center">
        <Button onClick={() => navigate("/auth")} className="bg-primary">
          Start Free Trial
        </Button>
        <Button variant="outline" onClick={() => navigate("/menu")}>View Menu</Button>
      </div>
    </section>
  );
}