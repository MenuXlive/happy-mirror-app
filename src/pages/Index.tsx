import { Button } from "@/components/ui/button";
import { Wine, Utensils, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-6 mb-20">
          <Wine className="w-16 h-16 text-primary" strokeWidth={1.5} />
          
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-5xl md:text-6xl font-bold text-primary">
                Premium Bar Menu
              </h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Hinjewadi, Pune
            </p>
          </div>

          <p className="text-lg max-w-2xl text-muted-foreground">
            Experience our exquisite collection of premium beverages and delicious cuisine
          </p>

          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => navigate('/menu')}
            >
              🍸 View Menu
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-foreground text-foreground hover:bg-foreground hover:text-background"
              onClick={() => navigate('/auth')}
            >
              🔐 Admin Login
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="text-5xl">🍷</div>
            <h3 className="text-xl font-semibold text-primary">Premium Selection</h3>
            <p className="text-muted-foreground">
              Curated collection of finest spirits
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="text-5xl">🍽️</div>
            <h3 className="text-xl font-semibold text-primary">Delicious Food</h3>
            <p className="text-muted-foreground">
              From starters to full course meals
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="text-5xl">✨</div>
            <h3 className="text-xl font-semibold text-primary">Premium Experience</h3>
            <p className="text-muted-foreground">
              Elegant ambiance and service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
