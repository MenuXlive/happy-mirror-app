import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Martini, Utensils, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { PRESET_PROMOTIONS, getPresetByKey } from "@/lib/promotions";
import { Instagram, Facebook, MapPin, Globe, Phone, Mail, Clock } from "lucide-react";

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

// Present alcohol price tiers as compact, readable chips
function alcoholPriceEntries(item: AlcoholItem) {
  const entries: { label: string; amount: number }[] = [];
  if (item.price_30ml != null) entries.push({ label: "30ml", amount: item.price_30ml });
  if (item.price_60ml != null) entries.push({ label: "60ml", amount: item.price_60ml });
  if (item.price_90ml != null) entries.push({ label: "90ml", amount: item.price_90ml });
  if (item.price_180ml != null) entries.push({ label: "180ml", amount: item.price_180ml });
  if (item.price_bottle != null) entries.push({ label: "Bottle", amount: item.price_bottle });
  return entries;
}

const Menu = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [view, setView] = useState<"drinks" | "food">("drinks");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [alcohol, setAlcohol] = useState<AlcoholItem[]>([]);
  const [food, setFood] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  // NEW: veg/non-veg filter for food
  const [foodTypeFilter, setFoodTypeFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [activePromotionKeys, setActivePromotionKeys] = useState<string[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);
  const [settings, setSettings] = useState<{
  instagram_url?: string | null;
  facebook_url?: string | null;
  website_url?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  hours?: string | null;
  google_maps_url?: string | null;
  embed_url?: string | null;
  show_map_embed?: boolean | null;
  bar_name?: string | null;
  logo_url?: string | null;
  updated_at?: string | null;
  id?: string;
}>({ id: "default", instagram_url: "", facebook_url: "", website_url: "", address: "", phone: "", email: "", hours: "", google_maps_url: "", embed_url: "", show_map_embed: false, bar_name: "", logo_url: "" });

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

  // Fetch active promotions (Supabase with localStorage fallback)
  useEffect(() => {
    async function fetchPromotions() {
      setLoadingPromotions(true);
      try {
        const { data, error } = await supabase.from("promotions").select("key,active");
        if (error) throw error;
        const keys = (data || []).filter((r: any) => r.active).map((r: any) => r.key);
        setActivePromotionKeys(keys);
        try { localStorage.setItem("activePromotions", JSON.stringify(keys)); } catch {}
      } catch (err) {
        try {
          const raw = localStorage.getItem("activePromotions");
          const keys = raw ? JSON.parse(raw) : [];
          setActivePromotionKeys(keys);
        } catch {}
      } finally {
        setLoadingPromotions(false);
      }
    }
    fetchPromotions();
  }, []);

  // Fetch venue settings (Supabase with localStorage fallback)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from("venue_settings")
            .select("id, instagram_url, facebook_url, website_url, address, phone, email, hours, google_maps_url, embed_url, show_map_embed, updated_at")
            .eq("id", "default")
            .maybeSingle();
          if (error) throw error;
          if (data) {
            setSettings({
              id: "default",
              instagram_url: data.instagram_url ?? "",
              facebook_url: data.facebook_url ?? "",
              website_url: data.website_url ?? "",
              address: data.address ?? "",
              phone: data.phone ?? "",
              email: data.email ?? "",
              hours: data.hours ?? "",
              google_maps_url: data.google_maps_url ?? "",
              embed_url: data.embed_url ?? "",
              show_map_embed: data.show_map_embed ?? false,
              bar_name: data.bar_name ?? "",
              logo_url: data.logo_url ?? "",
              updated_at: data.updated_at ?? null,
            });
          } else {
            const raw = localStorage.getItem("venue_settings");
            if (raw) setSettings(JSON.parse(raw));
          }
        } else {
          const raw = localStorage.getItem("venue_settings");
          if (raw) setSettings(JSON.parse(raw));
        }
      } catch (e) {
        const raw = localStorage.getItem("venue_settings");
        if (raw) setSettings(JSON.parse(raw));
      }
    };
    fetchSettings();
  }, []);

  const categoriesBuckets: CategoryBucket<AlcoholItem | FoodItem>[] = useMemo(() => {
    return view === "drinks" ? groupByCategory(alcohol) : groupByCategory(food);
  }, [view, alcohol, food]);

  const chips = useMemo(() => categoriesBuckets.map((c) => c.title), [categoriesBuckets]);

  // Active promotions derived from keys
  const activePromotions = useMemo(() => {
    return activePromotionKeys
      .map((k) => getPresetByKey(k))
      .filter(Boolean) as { key: string; title: string; description: string; category: string }[];
  }, [activePromotionKeys]);
  
  // Promotions filtered for current view
  const promotionsForView = useMemo(() => {
    if (activePromotions.length === 0) return [] as { key: string; title: string; description: string; category: string }[];
    if (view === "food") {
      return activePromotions.filter((p) => p.category === "food" || p.category === "general");
    }
    // drinks view
    return activePromotions.filter((p) => ["general", "drinks", "alcohol", "beer"].includes(p.category));
  }, [activePromotions, view]);

  const featuredItems = useMemo(() => {
    const source = view === "drinks" ? alcohol : food;
    return source.filter((it: any) => it.featured === true);
  }, [view, alcohol, food]);
  
  // Debounce the search input to reduce re-renders while typing
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);
  
  function getPromotionsForBucket(title: string) {
    const t = title.toLowerCase();
    return promotionsForView.filter((p) => {
      if (p.category === "general") return true;
      if (view === "food") return p.category === "food";
      // drinks view
      if (p.category === "alcohol" || p.category === "drinks") return true;
      if (p.category === "beer") return /beer/.test(t);
      return false;
    });
  }
  
  // Counts per category reflecting current search and veg/non-veg filters
  const chipCounts = useMemo(() => {
    const applyFoodType = (items: (AlcoholItem | FoodItem)[]) => {
      if (view !== "food") return items;
      if (foodTypeFilter === "veg") return items.filter((it) => (it as FoodItem).vegetarian === true);
      if (foodTypeFilter === "nonveg") return items.filter((it) => (it as FoodItem).vegetarian === false);
      return items;
    };
    const q = debouncedQuery.toLowerCase();
    const buckets = categoriesBuckets.map((bucket) => {
      const itemsAfterType = applyFoodType(bucket.items);
      const itemsAfterSearch = debouncedQuery.trim()
        ? itemsAfterType.filter((it) => {
            const nm = (it as any).name?.toLowerCase().includes(q);
            const tg = Array.isArray((it as any).tags) && (it as any).tags.some((t: string) => t.toLowerCase().includes(q));
            return nm || tg;
          })
        : itemsAfterType;
      return { title: bucket.title, items: itemsAfterSearch };
    });
    const m = new Map<string, number>();
    buckets.forEach((b) => m.set(b.title, b.items.length));
    return m;
  }, [categoriesBuckets, view, foodTypeFilter, searchQuery]);

  const visibleBuckets = useMemo(
    () => (selectedCategory ? categoriesBuckets.filter((c) => c.title === selectedCategory) : categoriesBuckets),
    [categoriesBuckets, selectedCategory],
  );

  const filteredBuckets = useMemo(() => {
    // Apply veg/non-veg filter when viewing food
    const applyFoodType = (items: (AlcoholItem | FoodItem)[]) => {
      if (view !== "food") return items;
      if (foodTypeFilter === "veg") return items.filter((it) => (it as FoodItem).vegetarian === true);
      if (foodTypeFilter === "nonveg") return items.filter((it) => (it as FoodItem).vegetarian === false);
      return items;
    };

    const buckets = visibleBuckets
      .map((bucket) => ({ title: bucket.title, items: applyFoodType(bucket.items) }))
      .filter((b) => b.items.length > 0);

    if (!debouncedQuery.trim()) return buckets;
    const q = debouncedQuery.toLowerCase();
    return buckets
      .map((bucket) => ({
        title: bucket.title,
        items: bucket.items.filter((it) => {
          const nm = (it as any).name?.toLowerCase().includes(q);
          const tg = Array.isArray((it as any).tags) && (it as any).tags.some((t: string) => t.toLowerCase().includes(q));
          return nm || tg;
        }),
      }))
      .filter((b) => b.items.length > 0);
  }, [visibleBuckets, debouncedQuery, view, foodTypeFilter]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Top Back to Home button removed as requested; one exists below */}

        <div className="text-center mb-6 space-y-2">
          <div className="flex items-center justify-center gap-3">
            {settings.logo_url && (
              <img src={settings.logo_url!} alt="Logo" className="h-12 w-12 object-contain rounded" />
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-primary">{settings.bar_name || "Our Menu"}</h1>
          </div>
          <p className="text-muted-foreground">Premium beverages and delicious cuisine</p>
        </div>

        {(settings.instagram_url || settings.facebook_url || settings.website_url || settings.address || settings.phone || settings.email || settings.hours || settings.google_maps_url) && (
          <div className="mb-4">
            <Card className="rounded-xl border bg-background/40 backdrop-blur-lg border-white/10 dark:border-white/5 shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary">Connect with us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      {settings.instagram_url && (
                        <a
                          href={settings.instagram_url!}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-background"
                        >
                          <Instagram className="h-4 w-4" />
                          <span className="text-sm">Instagram</span>
                        </a>
                      )}
                      {settings.facebook_url && (
                        <a
                          href={settings.facebook_url!}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-background"
                        >
                          <Facebook className="h-4 w-4" />
                          <span className="text-sm">Facebook</span>
                        </a>
                      )}
                      {settings.website_url && (
                        <a
                          href={settings.website_url!}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-background"
                        >
                          <Globe className="h-4 w-4" />
                          <span className="text-sm">Website</span>
                        </a>
                      )}
                      {settings.google_maps_url && (
                        <a
                          href={settings.google_maps_url!}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border hover:bg-background"
                        >
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">Google Maps</span>
                        </a>
                      )}
                      {settings.phone && (
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md border">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{settings.phone}</span>
                        </div>
                      )}
                      {settings.email && (
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md border">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{settings.email}</span>
                        </div>
                      )}
                      {settings.address && (
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md border">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm truncate max-w-[280px]">{settings.address}</span>
                        </div>
                      )}
                    </div>
                    {settings.hours && (
                      <div className="inline-flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{settings.hours}</span>
                      </div>
                    )}
                  </div>
                  {settings.show_map_embed && (settings.embed_url || settings.google_maps_url) && (
                    <div className="rounded-xl overflow-hidden border">
                      <iframe
                        src={(() => {
                          const embed = settings.embed_url?.trim();
                          if (embed) {
                            try {
                              const u = new URL(embed);
                              if (u.hostname.includes("google.") && u.pathname.startsWith("/maps/embed")) {
                                return embed;
                              }
                            } catch {}
                          }
                          const base = "https://www.google.com/maps";
                          const url = (settings.google_maps_url || "")!;
                          try {
                            const u = new URL(url);
                            const q = u.searchParams.get("q");
                            return `${base}?q=${encodeURIComponent(q || url)}&output=embed`;
                          } catch {
                            return `${base}?q=${encodeURIComponent(url)}&output=embed`;
                          }
                        })()}
                        width="100%"
                        height="260"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full h-[260px]"
                      ></iframe>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activePromotions.length > 0 && (
          <div className="mb-4">
            <Card className="rounded-xl border bg-gradient-to-r from-amber-50/40 to-primary/10 backdrop-blur-lg border-white/10 dark:border-white/5 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" /> Current Promotions
                </CardTitle>
                <p className="text-sm text-muted-foreground">Limited-time offers — grab them while they last!</p>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {activePromotions.map((p) => (
                    <div key={p.key} className="flex items-start gap-3 p-3 rounded-lg border bg-background/60 hover:bg-background/80 transition">
                      <Badge className="bg-gradient-to-r from-amber-600 to-pink-600 text-white shadow-sm capitalize">{p.category}</Badge>
                      <div>
                        <div className="font-semibold leading-tight">{p.title}</div>
                        {p.description && (
                          <p className="text-xs mt-0.5 text-muted-foreground">{p.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
            {chips.map((chip) => {
              const count = chipCounts.get(chip) ?? 0;
              return (
                <Button
                  key={chip}
                  variant={selectedCategory === chip ? "secondary" : "outline"}
                  size="default"
                  className="shrink-0 min-w-[72px]"
                  onClick={() => setSelectedCategory(selectedCategory === chip ? null : chip)}
                >
                  {chip} ({count})
                </Button>
              );
            })}
          </div>

          {/* NEW: Veg / Non-Veg filter when viewing Food */}
          {view === "food" && (
            <div className="mt-2 flex gap-2 justify-center">
              <Button
                variant={foodTypeFilter === "all" ? "secondary" : "outline"}
                size="default"
                onClick={() => setFoodTypeFilter("all")}
              >
                All
              </Button>
              <Button
                variant={foodTypeFilter === "veg" ? "secondary" : "outline"}
                size="default"
                onClick={() => setFoodTypeFilter("veg")}
              >
                Veg
              </Button>
              <Button
                variant={foodTypeFilter === "nonveg" ? "secondary" : "outline"}
                size="default"
                onClick={() => setFoodTypeFilter("nonveg")}
              >
                Non-Veg
              </Button>
            </div>
          )}

          <div className="mt-3 max-w-2xl mx-auto">
            <Input
              className="h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items (e.g., Mojito, Paneer, Whiskey)"
            />
          </div>
        </div>

        {/* Featured section */}
        {featuredItems.length > 0 && (
          <div className="mt-4 max-w-4xl mx-auto">
            <Card className="rounded-xl border bg-background/40 backdrop-blur-lg border-white/10 dark:border-white/5 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Sparkles className="h-5 w-5" /> Featured
                </CardTitle>
                <p className="text-sm text-muted-foreground">Handpicked favorites</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {featuredItems.slice(0, 6).map((it: any) => (
                    <div key={it.id} className="flex justify-between items-center py-2 border-t first:border-t-0 border-border/40">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{it.name}</span>
                        {Array.isArray(it.tags) && it.tags.includes('spicy') && (
                          <Badge className="bg-red-600 text-white">🌶️ Spicy</Badge>
                        )}
                        {Array.isArray(it.tags) && it.tags.includes('gluten_free') && (
                          <Badge className="bg-teal-600 text-white">🌾🚫 Gluten-free</Badge>
                        )}
                        {('vegetarian' in it) && it.vegetarian && (
                          <Badge className="bg-green-600 text-white">🌱 Veg</Badge>
                        )}
                        {Array.isArray(it.tags) && it.tags.includes('vegan') && (
                          <Badge className="bg-green-700 text-white">🌱 Vegan</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        {'price' in it ? (
                          <div className="text-primary font-semibold">{formatCurrencyINR(it.price)}</div>
                        ) : (
                          <div className="flex flex-wrap gap-2 justify-end">
                            {alcoholPriceEntries(it as AlcoholItem).map((e) => (
                              <Badge key={e.label} variant="outline" className="px-2.5 py-1 rounded-full">
                                <span className="opacity-80">{e.label}</span>
                                <span className="font-semibold ml-1">{formatCurrencyINR(e.amount)}</span>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cards */}
        {loading ? (
          <div className="mt-6 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="rounded-xl border bg-background/40 backdrop-blur-lg border-white/10 dark:border-white/5 shadow-lg">
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
              <Card key={bucket.title} className="group rounded-xl border bg-background/40 backdrop-blur-lg border-white/10 dark:border-white/5 shadow-lg hover:shadow-xl transition">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    {view === "drinks" ? <Martini className="h-5 w-5" /> : <Utensils className="h-5 w-5" />}
                    {bucket.title}
                  </CardTitle>
                  {/* Stylish per-category promotions chips */}
                  {getPromotionsForBucket(bucket.title).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {getPromotionsForBucket(bucket.title).map((p) => (
                        <Badge key={`${bucket.title}-${p.key}`} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm">
                          {p.title}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {bucket.items.map((item) => (
                      <div key={(item as any).id} className="py-3 first:pt-0 border-t border-border/40 first:border-t-0">
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-base truncate">{(item as any).name}</span>
                              {Array.isArray((item as any).tags) && (item as any).tags.includes('spicy') && (
                                <Badge className="bg-red-600 text-white">🌶️ Spicy</Badge>
                              )}
                              {Array.isArray((item as any).tags) && (item as any).tags.includes('gluten_free') && (
                                <Badge className="bg-teal-600 text-white">🌾🚫 Gluten-free</Badge>
                              )}
                              {Array.isArray((item as any).tags) && (item as any).tags.includes('vegan') && (
                                <Badge className="bg-green-700 text-white">🌱 Vegan</Badge>
                              )}
                              {"vegetarian" in item && (
                                <Badge className={(item as FoodItem).vegetarian ? "bg-green-600 text-white" : "bg-amber-600 text-white"}>
                                  {(item as FoodItem).vegetarian ? "Veg" : "Non-Veg"}
                                </Badge>
                              )}
                            </div>
                            {"description" in item && (item as FoodItem).description && (
                              <p className="text-sm leading-relaxed text-muted-foreground mt-1">{(item as FoodItem).description}</p>
                            )}
                            {"brand" in item && (item as AlcoholItem).brand && (
                              <p className="text-xs leading-relaxed text-muted-foreground mt-0.5">{(item as AlcoholItem).brand}</p>
                            )}
                          </div>

                          <div className="flex-shrink-0 text-right">
                            {"price" in item ? (
                              <div className="text-primary font-semibold text-base">{formatCurrencyINR((item as FoodItem).price)}</div>
                            ) : (
                              <div className="flex flex-wrap gap-2 justify-end">
                                {alcoholPriceEntries(item as AlcoholItem).map((e) => (
                                  <Badge key={e.label} variant="outline" className="px-2.5 py-1 rounded-full">
                                    <span className="opacity-80">{e.label}</span>
                                    <span className="font-semibold ml-1">{formatCurrencyINR(e.amount)}</span>
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
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
