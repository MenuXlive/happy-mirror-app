import { useEffect, useState } from "react";
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

const foodSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  category: z.string().trim().min(1, "Category is required").max(50, "Category must be less than 50 characters"),
  description: z.string().trim().max(500, "Description must be less than 500 characters").optional().nullable(),
  price: z.number().min(0, "Price must be positive").max(100000, "Price must be reasonable"),
  vegetarian: z.boolean(),
  available: z.boolean(),
});

// Canonical food categories
const FOOD_CATEGORIES = [
  "Starter",
  "Main Course",
  "Sides",
  "Dessert",
  "Beverages",
  "Salad",
  "Soup",
  "Pizza",
  "Burger",
  "Sandwich",
  "Rice",
  "Biryani",
  "Noodles",
  "Bread",
  "Curry",
  "Tandoori",
];

type FoodItem = Tables<"food_menu">;

export const FoodMenuManager = () => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<TablesInsert<"food_menu">>>({
    name: "",
    category: "",
    description: "",
    price: 0,
    vegetarian: false,
    available: true,
  });
  const { toast } = useToast();
  // NEW: admin-side filters for easy access
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [vegFilter, setVegFilter] = useState<"all" | "veg" | "nonveg">("all");
  // Controls whether we use a custom category text input
  const [useCustomCategory, setUseCustomCategory] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('food_menu')
      .select('*')
      .order('category');
    
    if (data) setItems(data);
    if (error) {
      toast({ title: "Error", description: "Failed to fetch menu items", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      foodSchema.parse(formData);
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
        .from('food_menu')
        .update(formData)
        .eq('id', editingId);
      
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Item updated successfully" });
      }
    } else {
      const { error } = await supabase
        .from('food_menu')
        .insert(formData as TablesInsert<"food_menu">);
      
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Item created successfully" });
      }
    }
    
    resetForm();
    fetchItems();
  };

  const handleEdit = (item: FoodItem) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('food_menu')
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
      category: "",
      description: "",
      price: 0,
      vegetarian: false,
      available: true,
    });
  };

  // Derived category chips
  const categories = Array.from(new Set(items.map((i) => i.category).filter(Boolean)));

  // Apply filters
  const filteredItems = items
    .filter((i) => (selectedCategory ? i.category === selectedCategory : true))
    .filter((i) => {
      if (vegFilter === "veg") return i.vegetarian === true;
      if (vegFilter === "nonveg") return i.vegetarian === false;
      return true;
    })
    .filter((i) => (searchQuery ? i.name.toLowerCase().includes(searchQuery.toLowerCase()) : true));

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-primary">
            {editingId ? "Edit Food Item" : "Add Food Item"}
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
                  {FOOD_CATEGORIES.map((c) => (
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
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                maxLength={500}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                max="100000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                required
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="vegetarian"
                  checked={formData.vegetarian || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, vegetarian: checked })}
                />
                <Label htmlFor="vegetarian">Vegetarian</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
                <Label htmlFor="available">Available</Label>
              </div>
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

      {/* NEW: admin filter toolbar */}
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
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant={vegFilter === "all" ? "secondary" : "outline"} size="sm" onClick={() => setVegFilter("all")}>All</Button>
            <Button variant={vegFilter === "veg" ? "secondary" : "outline"} size="sm" onClick={() => setVegFilter("veg")}>Veg</Button>
            <Button variant={vegFilter === "nonveg" ? "secondary" : "outline"} size="sm" onClick={() => setVegFilter("nonveg")}>Non-Veg</Button>
          </div>
          <div>
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search food items" />
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
                    {item.vegetarian && <span className="ml-2 text-xs text-green-500">(V)</span>}
                    {!item.available && <span className="ml-2 text-xs text-red-500">(Unavailable)</span>}
                  </h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  )}
                  <p className="text-primary font-semibold mt-2">${item.price}</p>
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
