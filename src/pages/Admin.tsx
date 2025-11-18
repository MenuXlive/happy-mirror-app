import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FoodMenuManager } from "@/components/admin/FoodMenuManager";
import { AlcoholMenuManager } from "@/components/admin/AlcoholMenuManager";
import { PromotionsManager } from "@/components/admin/PromotionsManager";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roleData?.role === 'admin') {
        setIsAdmin(true);
      } else {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Access Denied",
        description: "Unable to verify authentication",
        variant: "destructive",
      });
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Admin Panel</h1>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/admin/qr')} className="gap-2">
              <QrCode className="h-4 w-4" /> Generate QR
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="food" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="food">Food Menu</TabsTrigger>
            <TabsTrigger value="alcohol">Alcohol Menu</TabsTrigger>
            <TabsTrigger value="promotions">Promotions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="food" className="mt-6">
            <FoodMenuManager />
          </TabsContent>
          
          <TabsContent value="alcohol" className="mt-6">
            <AlcoholMenuManager />
          </TabsContent>
          
          <TabsContent value="promotions" className="mt-6">
            <PromotionsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
