import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Premium Bar Menu</h1>
          <p className="text-muted-foreground">
            Welcome. Browse our drinks and food menu.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/menu">
              <Button size="default" className="min-w-[140px]">Open Menu</Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline" size="default" className="min-w-[140px]">Admin</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
