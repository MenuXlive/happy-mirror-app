import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Promotion } from "@/lib/promotions";
import { PRESET_PROMOTIONS, getPresetByKey } from "@/lib/promotions";

// A minimal row shape for Supabase 'promotions' table if present
// Columns expected: key (text, PK), title (text), description (text), category (text), active (boolean)
type PromotionRow = {
  key: string;
  title: string;
  description: string;
  category: string;
  active: boolean;
};

function loadActiveKeysFromLocalStorage(): string[] {
  try {
    const raw = localStorage.getItem("activePromotions");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveActiveKeysToLocalStorage(keys: string[]) {
  try {
    localStorage.setItem("activePromotions", JSON.stringify(keys));
  } catch {}
}

export const PromotionsManager = () => {
  const { toast } = useToast();
  const [remotePromotions, setRemotePromotions] = useState<PromotionRow[] | null>(null);
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>(() => loadActiveKeysFromLocalStorage());

  const presets = PRESET_PROMOTIONS;

  useEffect(() => {
    async function fetchRemote() {
      setLoadingRemote(true);
      try {
        const { data, error } = await supabase.from("promotions").select("key,title,description,category,active");
        if (error) throw error;
        setRemotePromotions((data as PromotionRow[]) || []);
        // Sync local active keys with remote if present
        const remoteActive = ((data as PromotionRow[]) || []).filter((p) => p.active).map((p) => p.key);
        if (remoteActive.length > 0) {
          setActiveKeys(remoteActive);
          saveActiveKeysToLocalStorage(remoteActive);
        }
      } catch (err: any) {
        console.warn("Promotions table not available or error:", err?.message || err);
      } finally {
        setLoadingRemote(false);
      }
    }
    fetchRemote();
  }, []);

  const mergedPromotions: Promotion[] = useMemo(() => {
    if (!remotePromotions || remotePromotions.length === 0) return presets;
    const byKey = new Map(remotePromotions.map((r) => [r.key, r]));
    return presets.map((p) => {
      const r = byKey.get(p.key);
      return {
        ...p,
        title: r?.title ?? p.title,
        description: r?.description ?? p.description,
        category: (r?.category as Promotion["category"]) ?? p.category,
      };
    });
  }, [presets, remotePromotions]);

  async function setActive(key: string, active: boolean) {
    // Update local state immediately for responsiveness
    const nextKeys = active ? Array.from(new Set([...activeKeys, key])) : activeKeys.filter((k) => k !== key);
    setActiveKeys(nextKeys);
    saveActiveKeysToLocalStorage(nextKeys);

    // Try Supabase if table exists
    try {
      const preset = getPresetByKey(key);
      const payload: PromotionRow = {
        key,
        title: preset?.title ?? key,
        description: preset?.description ?? "",
        category: preset?.category ?? "general",
        active,
      };
      const { error } = await supabase.from("promotions").upsert(payload, { onConflict: "key" });
      if (error) throw error;
      toast({ title: active ? "Promotion Activated" : "Promotion Stopped", description: payload.title });
    } catch (err: any) {
      // Fallback already applied via localStorage; just inform user
      console.warn("Supabase promotions upsert failed (fallback to localStorage)", err?.message || err);
      toast({
        title: active ? "Promotion Activated (Local)" : "Promotion Stopped (Local)",
        description: getPresetByKey(key)?.title ?? key,
      });
    }
  }

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, Promotion[]>();
    mergedPromotions.forEach((p) => {
      const arr = map.get(p.category) || [];
      arr.push(p);
      map.set(p.category, arr);
    });
    return Array.from(map.entries()).map(([cat, items]) => ({ category: cat, items }));
  }, [mergedPromotions]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Promotions</h2>
        <p className="text-muted-foreground">Activate ready-made promotions or create attention-grabbing offers.</p>
      </div>

      {loadingRemote && (
        <div className="text-sm text-muted-foreground">Loading promotions from server…</div>
      )}

      {groupedByCategory.map((grp) => (
        <Card key={grp.category} className="border">
          <CardHeader>
            <CardTitle className="capitalize">{grp.category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {grp.items.map((p) => {
              const isActive = activeKeys.includes(p.key);
              return (
                <div key={p.key} className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.title}</span>
                      {isActive && <Badge className="bg-green-600 text-white">Active</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{p.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <Button variant="outline" onClick={() => setActive(p.key, false)}>Stop Promotion</Button>
                    ) : (
                      <Button onClick={() => setActive(p.key, true)}>Promote Now</Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};