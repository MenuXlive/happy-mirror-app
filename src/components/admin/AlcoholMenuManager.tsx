import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";

type AlcoholItem = Tables<"alcohol">;

export const AlcoholMenuManager = () => {
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

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('alcohol')
      .select('*')
      .order('category');
    
    if (data) setItems(data);
    if (error) console.error('Error fetching alcohol items:', error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand || ""}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_30ml">30ml ($)</Label>
                <Input
                  id="price_30ml"
                  type="number"
                  step="0.01"
                  value={formData.price_30ml || ""}
                  onChange={(e) => setFormData({ ...formData, price_30ml: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_60ml">60ml ($)</Label>
                <Input
                  id="price_60ml"
                  type="number"
                  step="0.01"
                  value={formData.price_60ml || ""}
                  onChange={(e) => setFormData({ ...formData, price_60ml: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_90ml">90ml ($)</Label>
                <Input
                  id="price_90ml"
                  type="number"
                  step="0.01"
                  value={formData.price_90ml || ""}
                  onChange={(e) => setFormData({ ...formData, price_90ml: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_180ml">180ml ($)</Label>
                <Input
                  id="price_180ml"
                  type="number"
                  step="0.01"
                  value={formData.price_180ml || ""}
                  onChange={(e) => setFormData({ ...formData, price_180ml: e.target.value ? parseFloat(e.target.value) : null })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price_bottle">Bottle ($)</Label>
                <Input
                  id="price_bottle"
                  type="number"
                  step="0.01"
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

      <div className="space-y-4">
        {items.map((item) => (
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
                    {item.price_30ml && <span className="text-primary">30ml: ${item.price_30ml}</span>}
                    {item.price_60ml && <span className="text-primary">60ml: ${item.price_60ml}</span>}
                    {item.price_90ml && <span className="text-primary">90ml: ${item.price_90ml}</span>}
                    {item.price_180ml && <span className="text-primary">180ml: ${item.price_180ml}</span>}
                    {item.price_bottle && <span className="text-primary">Bottle: ${item.price_bottle}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" onClick={() => handleEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
