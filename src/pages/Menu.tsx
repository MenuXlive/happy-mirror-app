import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Martini, Utensils } from "lucide-react";
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

function formatCurrencyINR(n: number) {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `₹${n}`;
  }
}

function formatAlcoholPrices(item: AlcoholItem) {
  const parts: string[] = [];
  if (item.price_30ml != null) parts.push(`30ml ${formatCurrencyINR(item.price_30ml)}`);
  if (item.price_60ml != null) parts.push(`60ml ${formatCurrencyINR(item.price_60ml)}`);
  if (item.price_90ml != null) parts.push(`90ml ${formatCurrencyINR(item.price_90ml)}`);
  if (item.price_180ml != null) parts.push(`180ml ${formatCurrencyINR(item.price_180ml)}`);
  if (item.price_bottle != null) parts.push(`Bottle ${formatCurrencyINR(item.price_bottle)}`);
  return parts.join(" • ");
}

const Menu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [view, setView] = useState<"drinks" | "food">("drinks");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredBuckets = useMemo(() => {
    if (!searchQuery.trim()) return visibleBuckets;
    const q = searchQuery.toLowerCase();
    return visibleBuckets
      .map((bucket) => ({
        title: bucket.title,
        items: bucket.items.filter((it) => (it as any).name?.toLowerCase().includes(q)),
      }))
      .filter((b) => b.items.length > 0);
  }, [visibleBuckets, searchQuery]);

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

        {/* Sticky filter/search bar */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 -mx-4 px-4 border-b">
          <div className="flex w-full max-w-2xl mx-auto rounded-full border border-border overflow-hidden">
            <Button
              variant={view === "drinks" ? "default" : "ghost"}
              className={`flex-1 rounded-none ${view === "drinks" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => {
                setView("drinks");
                setSelectedCategory(null);
              }}
            >
              <Martini className="mr-2 h-4 w-4" /> Drinks
            </Button>
            <Button
              variant={view === "food" ? "default" : "ghost"}
              className={`flex-1 rounded-none ${view === "food" ? "bg-primary text-primary-foreground" : ""}`}
              onClick={() => {
                setView("food");
                setSelectedCategory(null);
              }}
            >
              <Utensils className="mr-2 h-4 w-4" /> Food
            </Button>
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar py-1">
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

          <div className="mt-3 max-w-2xl mx-auto">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items (e.g., Mojito, Paneer, Whiskey)"
            />
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="mt-6 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="rounded-xl border bg-card/70 backdrop-blur-sm shadow-sm">
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {[...Array(4)].map((__, j) => (
                    <div key={j} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBuckets.length === 0 ? (
          <div className="mt-10 text-center text-muted-foreground">No items found. Try clearing filters or search.</div>
        ) : (
          <div className="mt-6 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {filteredBuckets.map((bucket) => (
              <Card key={bucket.title} className="group rounded-xl border bg-card/70 backdrop-blur-sm shadow-sm hover:shadow-md transition">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    {view === "drinks" ? <Martini className="h-5 w-5" /> : <Utensils className="h-5 w-5" />}
                    {bucket.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bucket.items.map((item) => (
                      <div key={(item as any).id} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{(item as any).name}</span>
                            {"vegetarian" in item && (
                              <Badge className={(item as FoodItem).vegetarian ? "bg-green-600 text-white" : "bg-amber-600 text-white"}>
                                {(item as FoodItem).vegetarian ? "Veg" : "Non-Veg"}
                              </Badge>
                            )}
                          </div>
                          {"price" in item ? (
                            <span className="text-primary font-semibold">{formatCurrencyINR((item as FoodItem).price)}</span>
                          ) : (
                            <span className="text-primary font-semibold text-sm">{formatAlcoholPrices(item as AlcoholItem)}</span>
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
