import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import logoAsset from "@/assets/company-logo.png.asset.json";
const companyLogo = logoAsset.url;
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("admin@buildcrm.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (session) {
    navigate("/", { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/", { replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <img src={companyLogo} alt="City Homes Technical Services" className="h-24 w-auto object-contain" />
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">City Homes Technical Services</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@buildcrm.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full gradient-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">Contact your administrator for account access</p>
      </Card>
    </div>
  );
}
