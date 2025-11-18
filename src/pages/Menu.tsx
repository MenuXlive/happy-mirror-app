import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type AlcoholItem = Tables<"alcohol">;
type FoodItem = Tables<"food_menu">;

type CategoryBucket<T> = { title: string; items: T[] };

function groupByCategory<T extends { category: string }>(items: T[]): CategoryBucket<T>[] {
  const map = new Map<string, T[]>();
  items.forEach((it) => {
    const key = it.category || "Uncategorized";
    const arr = map.get(key) || [];
    arr.push(it);
    map.set(key, arr);
  });
  return Array.from(map.entries()).map(([title, items]) => ({ title, items }));
}

function formatAlcoholPrices(item: AlcoholItem) {
  const parts: string[] = [];
  if (item.price_30ml != null) parts.push(`30ml ₹${item.price_30ml}`);
  if (item.price_60ml != null) parts.push(`60ml ₹${item.price_60ml}`);
  if (item.price_90ml != null) parts.push(`90ml ₹${item.price_90ml}`);
  if (item.price_180ml != null) parts.push(`180ml ₹${item.price_180ml}`);
  if (item.price_bottle != null) parts.push(`Bottle ₹${item.price_bottle}`);
  return parts.join(" • ");
}

const Menu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [view, setView] = useState<"drinks" | "food">("drinks");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [alcohol, setAlcohol] = useState<AlcoholItem[]>([]);
  const [food, setFood] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      try {
        const [{ data: alcoholData, error: alcoholError }, { data: foodData, error: foodError }] = await Promise.all([
          supabase.from("alcohol").select("*").eq("available", true).order("category"),
          supabase.from("food_menu").select("*").eq("available", true).order("category"),
        ]);
        if (alcoholError) throw alcoholError;
        if (foodError) throw foodError;
        setAlcohol(alcoholData || []);
        setFood(foodData || []);
      } catch (err: any) {
        console.error("Menu fetch error:", err?.message || err);
        toast({ title: "Unable to load menu", description: "Please check your connection or try again.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [toast]);

  const categoriesBuckets: CategoryBucket<AlcoholItem | FoodItem>[] = useMemo(() => {
    return view === "drinks" ? groupByCategory(alcohol) : groupByCategory(food);
  }, [view, alcohol, food]);

  const chips = useMemo(() => categoriesBuckets.map((c) => c.title), [categoriesBuckets]);

  const visibleBuckets = useMemo(
    () => (selectedCategory ? categoriesBuckets.filter((c) => c.title === selectedCategory) : categoriesBuckets),
    [categoriesBuckets, selectedCategory],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 text-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>

        <div className="text-center mb-6 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Our Menu</h1>
          <p className="text-muted-foreground">Premium beverages and delicious cuisine</p>
        </div>

        {/* Segmented control */}
        <div className="flex w-full max-w-md mx-auto rounded-full border border-border overflow-hidden">
          <Button
            variant={view === "drinks" ? "default" : "ghost"}
            className={`flex-1 rounded-none ${view === "drinks" ? "bg-primary text-primary-foreground" : ""}`}
            onClick={() => {
              setView("drinks");
              setSelectedCategory(null);
            }}
          >
            🍸 Drinks
          </Button>
          <Button
            variant={view === "food" ? "default" : "ghost"}
            className={`flex-1 rounded-none ${view === "food" ? "bg-primary text-primary-foreground" : ""}`}
            onClick={() => {
              setView("food");
              setSelectedCategory(null);
            }}
          >
            🍽️ Food
          </Button>
        </div>

        {/* Category chips */}
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar py-1">
          {chips.map((chip) => (
            <Button
              key={chip}
              variant={selectedCategory === chip ? "secondary" : "outline"}
              size="sm"
              className="shrink-0"
              onClick={() => setSelectedCategory(selectedCategory === chip ? null : chip)}
            >
              {chip}
            </Button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="mt-10 text-center text-muted-foreground">Loading menu…</div>
        ) : visibleBuckets.length === 0 ? (
          <div className="mt-10 text-center text-muted-foreground">No items found.</div>
        ) : (
          <div className="mt-6 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {visibleBuckets.map((bucket) => (
              <Card key={bucket.title} className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-primary">{bucket.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bucket.items.map((item) => (
                      <div key={(item as any).id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span>{(item as any).name}</span>
                          {"price" in item ? (
                            <span className="text-primary font-semibold">₹{(item as FoodItem).price}</span>
                          ) : (
                            <span className="text-primary font-semibold">{formatAlcoholPrices(item as AlcoholItem)}</span>
                          )}
                        </div>
                        {"description" in item && (item as FoodItem).description && (
                          <p className="text-sm text-muted-foreground">{(item as FoodItem).description}</p>
                        )}
                        {"brand" in item && (item as AlcoholItem).brand && (
                          <p className="text-xs text-muted-foreground">{(item as AlcoholItem).brand}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
