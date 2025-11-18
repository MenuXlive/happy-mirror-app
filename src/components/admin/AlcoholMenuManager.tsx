import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import { z } from "zod";

const alcoholSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  brand: z.string().trim().max(100, "Brand must be less than 100 characters").optional().nullable(),
  category: z.string().trim().min(1, "Category is required").max(50, "Category must be less than 50 characters"),
  price_30ml: z.number().min(0, "Price must be positive").max(100000, "Price must be reasonable").optional().nullable(),
  price_60ml: z.number().min(0, "Price must be positive").max(100000, "Price must be reasonable").optional().nullable(),
  price_90ml: z.number().min(0, "Price must be positive").max(100000, "Price must be reasonable").optional().nullable(),
  price_180ml: z.number().min(0, "Price must be positive").max(100000, "Price must be reasonable").optional().nullable(),
  price_bottle: z.number().min(0, "Price must be positive").max(100000, "Price must be reasonable").optional().nullable(),
  available: z.boolean(),
});

// Canonical alcohol categories/types
const ALCOHOL_CATEGORIES = [
  "Whisky",
  "Scotch",
  "Vodka",
  "Rum",
  "Gin",
  "Tequila",
  "Brandy",
  "Wine",
  "Beer",
  "Cider",
  "Liqueur",
  "Cocktail",
  "Sake",
  "Champagne",
  "Port",
  "Other Spirits",
];

type AlcoholItem = Tables<"alcohol">;

export const AlcoholMenuManager = () => {
  const formatCurrencyINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const [items, setItems] = useState<AlcoholItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<TablesInsert<"alcohol">>>({
    name: "",
    brand: "",
    category: "",
    price_30ml: null,
    price_60ml: null,
    price_90ml: null,
    price_180ml: null,
    price_bottle: null,
    available: true,
  });
  const { toast } = useToast();
  // NEW admin filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // Controls whether we use a custom category text input
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  // Filter by availability (all, available, unavailable)
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");
  // Bulk selection for multi-item actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const selectAllVisible = () => {
    setSelectedIds(new Set(filteredItems.map((i) => i.id)));
  };
  const clearSelection = () => setSelectedIds(new Set());

  const bulkSetAvailability = async (makeAvailable: boolean) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      toast({ title: "No items selected", description: "Select items to apply bulk action." });
      return;
    }
    const { error } = await supabase
      .from('alcohol_menu')
      .update({ available: makeAvailable })
      .in('id', ids);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Marked ${ids.length} item(s) as ${makeAvailable ? 'Available' : 'Unavailable'}` });
      clearSelection();
      fetchItems();
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('alcohol')
      .select('*')
      .order('category');
    
    if (data) setItems(data);
    if (error) {
      toast({ title: "Error", description: "Failed to fetch alcohol items", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      alcoholSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({ 
          title: "Validation Error", 
          description: error.errors[0].message, 
          variant: "destructive" 
        });
        return;
      }
    }
    
    if (editingId) {
      const { error } = await supabase
        .from('alcohol')
        .update(formData)
        .eq('id', editingId);
      
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Item updated successfully" });
      }
    } else {
      const { error } = await supabase
        .from('alcohol')
        .insert(formData as TablesInsert<"alcohol">);
      
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Item created successfully" });
      }
    }
    
    resetForm();
    fetchItems();
  };

  const handleEdit = (item: AlcoholItem) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('alcohol')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Item deleted successfully" });
      fetchItems();
    }
  };

  // Quick toggle availability without editing form
  const handleToggleAvailability = async (item: AlcoholItem) => {
    const { error } = await supabase
      .from('alcohol')
      .update({ available: !item.available })
      .eq('id', item.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: `Marked as ${!item.available ? 'Available' : 'Unavailable'}` });
      fetchItems();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      brand: "",
      category: "",
      price_30ml: null,
      price_60ml: null,
      price_90ml: null,
      price_180ml: null,
      price_bottle: null,
      available: true,
    });
  };

  // Derived categories from existing items
  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));
  // Availability counts per category
  const categoryCounts = useMemo(() => {
    const map = new Map<string, { availableCount: number; unavailableCount: number }>();
    ALCOHOL_CATEGORIES.forEach((c) => {
      const itemsInCat = items.filter((i) => i.category === c)
        .filter((i) => (searchQuery ? i.name.toLowerCase().includes(searchQuery.toLowerCase()) : true));
      const availableCount = itemsInCat.filter((i) => i.available).length;
      const unavailableCount = itemsInCat.length - availableCount;
      map.set(c, { availableCount, unavailableCount });
    });
    return map;
  }, [items, searchQuery]);
  // Apply filters to items list
  const filteredItems = items
    .filter((i) => (selectedCategory ? i.category === selectedCategory : true))
    .filter((i) => (searchQuery ? i.name.toLowerCase().includes(searchQuery.toLowerCase()) : true))
    .filter((i) => {
      if (availabilityFilter === "available") return i.available === true;
      if (availabilityFilter === "unavailable") return i.available === false;
      return true;
    });

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-primary">
            {editingId ? "Edit Alcohol Item" : "Add Alcohol Item"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand || ""}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  maxLength={100}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="h-10 px-3 border rounded-md bg-background text-foreground"
                value={useCustomCategory ? "__custom__" : (formData.category || "")}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__custom__") {
                    setUseCustomCategory(true);
                    setFormData({ ...formData, category: "" });
                  } else {
                    setUseCustomCategory(false);
                    setFormData({ ...formData, category: val });
                  }
                }}
                required
              >
                <option value="" disabled>
                  Select category
                </option>
                {ALCOHOL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="__custom__">Custom...</option>
              </select>
              {useCustomCategory && (
                <div className="mt-2">
                  <Input
                    id="custom_category"
                    placeholder="Enter custom category"
                    value={formData.category || ""}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    maxLength={50}
                    required
                  />
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_30ml">30ml (INR)</Label>
                <Input
                  id="price_30ml"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100000"
                  value={formData.price_30ml || ""}
                  onChange={(e) => setFormData({ ...formData, price_30ml: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_60ml">60ml (INR)</Label>
                <Input
                  id="price_60ml"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100000"
                  value={formData.price_60ml || ""}
                  onChange={(e) => setFormData({ ...formData, price_60ml: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_90ml">90ml (INR)</Label>
                <Input
                  id="price_90ml"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100000"
                  value={formData.price_90ml || ""}
                  onChange={(e) => setFormData({ ...formData, price_90ml: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_180ml">180ml (INR)</Label>
                <Input
                  id="price_180ml"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100000"
                  value={formData.price_180ml || ""}
                  onChange={(e) => setFormData({ ...formData, price_180ml: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_bottle">Bottle (INR)</Label>
                <Input
                  id="price_bottle"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100000"
                  value={formData.price_bottle || ""}
                  onChange={(e) => setFormData({ ...formData, price_bottle: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                checked={formData.available ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
              />
              <Label htmlFor="available">Available</Label>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="bg-primary">
                <Plus className="mr-2 h-4 w-4" />
                {editingId ? "Update" : "Add"} Item
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* NEW: admin filter toolbar for alcohol */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6 space-y-3">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Button
                key={c}
                variant={selectedCategory === c ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(selectedCategory === c ? null : c)}
              >
                {c}
                {categoryCounts.has(c) && (
                  <span className="ml-2 text-xs opacity-70">A: {categoryCounts.get(c)!.availableCount} • U: {categoryCounts.get(c)!.unavailableCount}</span>
                )}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant={availabilityFilter === "all" ? "secondary" : "outline"} size="sm" onClick={() => setAvailabilityFilter("all")}>All</Button>
            <Button variant={availabilityFilter === "available" ? "secondary" : "outline"} size="sm" onClick={() => setAvailabilityFilter("available")}>Available</Button>
            <Button variant={availabilityFilter === "unavailable" ? "secondary" : "outline"} size="sm" onClick={() => setAvailabilityFilter("unavailable")}>Unavailable</Button>
          </div>
          <div>
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search alcohol items" />
          </div>
          {/* Bulk actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t mt-2">
            <Button variant="outline" size="sm" onClick={selectAllVisible}>Select All (visible)</Button>
            <Button variant="outline" size="sm" onClick={clearSelection}>Clear Selection</Button>
            <Button variant="secondary" size="sm" onClick={() => bulkSetAvailability(true)}>Mark Available</Button>
            <Button variant="secondary" size="sm" onClick={() => bulkSetAvailability(false)}>Mark Unavailable</Button>
            <span className="text-xs text-muted-foreground">Selected: {selectedIds.size}</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">
                    {item.name}
                    {!item.available && <span className="ml-2 text-xs text-red-500">(Unavailable)</span>}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                  {item.brand && (
                    <p className="text-sm text-muted-foreground">{item.brand}</p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2 text-sm">
                    {item.price_30ml && <span className="text-primary">30ml: {formatCurrencyINR(item.price_30ml)}</span>}
                    {item.price_60ml && <span className="text-primary">60ml: {formatCurrencyINR(item.price_60ml)}</span>}
                    {item.price_90ml && <span className="text-primary">90ml: {formatCurrencyINR(item.price_90ml)}</span>}
                    {item.price_180ml && <span className="text-primary">180ml: {formatCurrencyINR(item.price_180ml)}</span>}
                    {item.price_bottle && <span className="text-primary">Bottle: {formatCurrencyINR(item.price_bottle)}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant={item.available ? "outline" : "secondary"} onClick={() => handleToggleAvailability(item)}>
                    {item.available ? "Mark Unavailable" : "Mark Available"}
                  </Button>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} />
                    Select
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
