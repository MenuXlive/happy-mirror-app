import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/admin');
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        navigate('/admin');
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (error) throw error;

      toast({
        title: "Sign Up Successful",
        description: "Please check your email to verify your account.",
      });
      setIsSignUp(false);
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link.",
      });
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 text-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">
              {isForgotPassword ? "Reset Password" : isSignUp ? "Admin Sign Up" : "Admin Login"}
            </CardTitle>
            <CardDescription>
              {isForgotPassword 
                ? "Enter your email to receive a password reset link"
                : isSignUp 
                ? "Create a new admin account"
                : "Enter your credentials to access the admin panel"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form 
              onSubmit={isForgotPassword ? handleForgotPassword : isSignUp ? handleSignUp : handleLogin} 
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background border-border"
                />
              </div>
              {!isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background border-border"
                  />
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
              >
                {loading 
                  ? isForgotPassword ? "Sending..." : isSignUp ? "Signing up..." : "Logging in..." 
                  : isForgotPassword ? "Send Reset Link" : isSignUp ? "Sign Up" : "Login"}
              </Button>
            </form>
            
            <div className="mt-4 space-y-2 text-center text-sm">
              {!isForgotPassword && (
                <Button
                  variant="link"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => setIsSignUp(!isSignUp)}
                  type="button"
                >
                  {isSignUp ? "Already have an account? Login" : "Need an account? Sign up"}
                </Button>
              )}
              <Button
                variant="link"
                className="text-muted-foreground hover:text-primary block w-full"
                onClick={() => {
                  setIsForgotPassword(!isForgotPassword);
                  if (!isForgotPassword) setIsSignUp(false);
                }}
                type="button"
              >
                {isForgotPassword ? "Back to Login" : "Forgot Password?"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
