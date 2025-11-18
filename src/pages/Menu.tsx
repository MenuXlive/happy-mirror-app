import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Menu = () => {
  const navigate = useNavigate();

  const beverageCategories = [
    {
      title: "Premium Spirits",
      items: [
        { name: "Single Malt Whiskey", price: "₹800" },
        { name: "Premium Vodka", price: "₹600" },
        { name: "Aged Rum", price: "₹700" },
        { name: "Cognac", price: "₹1200" },
      ]
    },
    {
      title: "Wines",
      items: [
        { name: "Red Wine Selection", price: "₹500" },
        { name: "White Wine Selection", price: "₹500" },
        { name: "Sparkling Wine", price: "₹800" },
        { name: "Rose Wine", price: "₹600" },
      ]
    },
    {
      title: "Cocktails",
      items: [
        { name: "Classic Mojito", price: "₹400" },
        { name: "Cosmopolitan", price: "₹450" },
        { name: "Old Fashioned", price: "₹500" },
        { name: "Margarita", price: "₹450" },
      ]
    }
  ];

  const foodCategories = [
    {
      title: "Starters",
      items: [
        { name: "Paneer Tikka", price: "₹350" },
        { name: "Chicken Wings", price: "₹400" },
        { name: "Nachos Supreme", price: "₹300" },
        { name: "Bruschetta", price: "₹280" },
      ]
    },
    {
      title: "Main Course",
      items: [
        { name: "Grilled Chicken", price: "₹550" },
        { name: "Fish & Chips", price: "₹600" },
        { name: "Pasta Alfredo", price: "₹450" },
        { name: "Paneer Butter Masala", price: "₹400" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 text-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">Our Menu</h1>
          <p className="text-muted-foreground">Premium beverages and delicious cuisine</p>
        </div>

        <div className="space-y-12 max-w-4xl mx-auto">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-6 text-center">🍸 Beverages</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {beverageCategories.map((category, idx) => (
                <Card key={idx} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-primary">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex justify-between items-center">
                          <span>{item.name}</span>
                          <span className="text-primary font-semibold">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-primary mb-6 text-center">🍽️ Food</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {foodCategories.map((category, idx) => (
                <Card key={idx} className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-primary">{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {category.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex justify-between items-center">
                          <span>{item.name}</span>
                          <span className="text-primary font-semibold">{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
