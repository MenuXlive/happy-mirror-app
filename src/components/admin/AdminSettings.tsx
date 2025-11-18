import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@supabase/supabase-js";
import { Switch } from "@/components/ui/switch";

// Simple Supabase helper that respects existing env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export type VenueSettings = {
  id: string; // fixed to 'default'
  instagram_url?: string | null;
  facebook_url?: string | null;
  website_url?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  hours?: string | null; // free text for now (e.g., Mon-Fri 9am-11pm; Sat-Sun 10am-12am)
  google_maps_url?: string | null;
  embed_url?: string | null; // optional advanced embed URL (https://www.google.com/maps/embed?pb=...)
  show_map_embed?: boolean | null;
  bar_name?: string | null;
  logo_url?: string | null;
  updated_at?: string | null;
};

const DEFAULT_ID = "default";
const LS_KEY = "venue_settings";

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<VenueSettings>({ id: DEFAULT_ID, instagram_url: "", facebook_url: "", website_url: "", address: "", phone: "", email: "", hours: "", google_maps_url: "", embed_url: "", show_map_embed: false, bar_name: "", logo_url: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from("venue_settings")
            .select("id, instagram_url, facebook_url, website_url, address, phone, email, hours, google_maps_url, embed_url, show_map_embed, bar_name, logo_url, updated_at")
            .eq("id", DEFAULT_ID)
            .maybeSingle();
          if (error) throw error;
          if (data) {
            setForm({
              id: DEFAULT_ID,
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
            // Fallback to localStorage when no data
            const raw = localStorage.getItem(LS_KEY);
            if (raw) {
              const parsed = JSON.parse(raw);
              setForm({ ...form, ...parsed });
            }
          }
        } else {
          const raw = localStorage.getItem(LS_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            setForm({ ...form, ...parsed });
          }
        }
      } catch (e: any) {
        console.warn("Settings fetch error, using localStorage fallback:", e?.message || e);
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setForm({ ...form, ...parsed });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      const payload = {
        id: DEFAULT_ID,
        instagram_url: form.instagram_url || null,
        facebook_url: form.facebook_url || null,
        website_url: form.website_url || null,
        address: form.address || null,
        phone: form.phone || null,
        email: form.email || null,
        hours: form.hours || null,
        google_maps_url: form.google_maps_url || null,
        embed_url: form.embed_url || null,
        show_map_embed: !!form.show_map_embed,
        bar_name: form.bar_name || null,
        logo_url: form.logo_url || null,
        updated_at: new Date().toISOString(),
      };
      if (supabase) {
        const { error } = await supabase.from("venue_settings").upsert(payload, { onConflict: "id" });
        if (error) throw error;
      }
      localStorage.setItem(LS_KEY, JSON.stringify(payload));
      toast({ title: "Saved", description: "Settings updated successfully." });
    } catch (e: any) {
      toast({ title: "Error saving", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-primary">Venue Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram_url">Instagram URL</Label>
              <Input
                id="instagram_url"
                placeholder="https://instagram.com/yourhandle"
                value={form.instagram_url || ""}
                onChange={(e) => setForm((f) => ({ ...f, instagram_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook_url">Facebook URL</Label>
              <Input
                id="facebook_url"
                placeholder="https://facebook.com/yourpage"
                value={form.facebook_url || ""}
                onChange={(e) => setForm((f) => ({ ...f, facebook_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                placeholder="https://yourwebsite.com"
                value={form.website_url || ""}
                onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="google_maps_url">Google Maps URL</Label>
              <Input
                id="google_maps_url"
                placeholder="https://maps.google.com/?q=..."
                value={form.google_maps_url || ""}
                onChange={(e) => setForm((f) => ({ ...f, google_maps_url: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="embed_url">Google Maps Embed URL (advanced)</Label>
              <Input
                id="embed_url"
                placeholder="https://www.google.com/maps/embed?pb=..."
                value={form.embed_url || ""}
                onChange={(e) => setForm((f) => ({ ...f, embed_url: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Paste the official Google Maps Embed URL for complex place pages. If provided, this will be used directly.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                value={form.phone || ""}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="contact@yourdomain.com"
                type="email"
                value={form.email || ""}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main Street, City"
                value={form.address || ""}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                placeholder="Mon-Fri 9am-11pm; Sat-Sun 10am-12am"
                value={form.hours || ""}
                onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bar_name">Bar Name</Label>
              <Input
                id="bar_name"
                placeholder="Your Bar Name"
                value={form.bar_name || ""}
                onChange={(e) => setForm((f) => ({ ...f, bar_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="logo_url">Logo URL (optional if uploading below)</Label>
              <Input
                id="logo_url"
                placeholder="https://yourcdn.com/logo.png"
                value={form.logo_url || ""}
                onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">You can paste a logo image URL or upload a file below. If both are provided, the uploaded file URL will be used.</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="logo_upload">Upload Logo</Label>
              <Input
                id="logo_upload"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!supabase) {
                    toast({ title: "Upload unavailable", description: "Supabase is not configured.", variant: "destructive" });
                    return;
                  }
                  try {
                    const fileName = `logos/${Date.now()}_${file.name}`;
                    const { data, error } = await supabase.storage.from("public").upload(fileName, file, { upsert: false });
                    if (error) throw error;
                    const { data: pub } = supabase.storage.from("public").getPublicUrl(data.path);
                    const publicUrl = pub.publicUrl;
                    setForm((f) => ({ ...f, logo_url: publicUrl }));
                    toast({ title: "Logo uploaded", description: "Public URL saved to settings." });
                  } catch (err: any) {
                    toast({ title: "Upload failed", description: err?.message || String(err), variant: "destructive" });
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-3 md:col-span-2">
              <Switch id="show_map_embed" checked={!!form.show_map_embed} onCheckedChange={(val) => setForm((f) => ({ ...f, show_map_embed: val }))} />
              <Label htmlFor="show_map_embed">Show Google Map embed alongside contact card</Label>
            </div>
            <p className="text-xs text-muted-foreground md:col-span-2">Tip: Provide either a Google Maps URL with ?q=... or paste an official Embed URL. We’ll render the best available map.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={loading} className="bg-primary">
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}