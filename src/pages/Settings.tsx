import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Save, Lock, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, profile, role } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pwd, setPwd] = useState({ next: "", confirm: "" });
  const [pwdSaving, setPwdSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || "");
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const initials = fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "U";

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user.id);
      if (error) throw error;
      setAvatarUrl(publicUrl);
      toast({ title: "Avatar updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setUploading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ full_name: fullName }).eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Profile updated" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (pwd.next.length < 6) { toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return; }
    if (pwd.next !== pwd.confirm) { toast({ title: "Passwords do not match", variant: "destructive" }); return; }
    setPwdSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwd.next });
      if (error) throw error;
      toast({ title: "Password updated" });
      setPwd({ next: "", confirm: "" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setPwdSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage your profile and account preferences</p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Profile Picture</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    {avatarUrl && <AvatarImage src={avatarUrl} />}
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-background hover:bg-muted transition text-sm font-medium">
                        <Camera className="h-4 w-4" />
                        {uploading ? "Uploading..." : "Change Photo"}
                      </div>
                      <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">JPG, PNG up to 5MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={email} disabled />
                  <p className="text-xs text-muted-foreground mt-1">Contact admin to change your email</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />{role || "None"}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6 mt-4">
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" />Change Password</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>New Password</Label>
                  <Input type="password" value={pwd.next} onChange={e => setPwd({...pwd, next: e.target.value})} placeholder="Min 6 characters" />
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <Input type="password" value={pwd.confirm} onChange={e => setPwd({...pwd, confirm: e.target.value})} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleChangePassword} disabled={pwdSaving || !pwd.next}>
                    {pwdSaving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}