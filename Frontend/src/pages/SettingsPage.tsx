import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import api from "@/api/axios";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  const updateMut = useMutation({
    mutationFn: (data: any) => api.put("/auth/profile", data),
    onSuccess: (res) => {
      setUser(res.data.data);
      toast.success("Profile updated successfully");
    },
    onError: () => toast.error("Failed to update profile")
  });

  const handleSave = () => {
    updateMut.mutate({ name, email });
  };

  const changePassMut = useMutation({
    mutationFn: (data: any) => api.post("/auth/change-password", data),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setPasswords({ current: "", new: "", confirm: "" });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to change password");
    }
  });

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      return toast.error("Please fill all fields");
    }
    if (passwords.new !== passwords.confirm) {
      return toast.error("New passwords do not match");
    }
    changePassMut.mutate({
      currentPassword: passwords.current,
      newPassword: passwords.new
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account preferences</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid gap-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <Button onClick={handleSave} disabled={updateMut.isPending} className="rounded-xl font-bold">
            <Save className="mr-2 h-4 w-4" />
            {updateMut.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={showPasswords.current ? "text" : "password"}
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-primary transition-colors z-10"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showPasswords.new ? "text" : "password"}
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-primary transition-colors z-10"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              >
                {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Confirm New Password</Label>
            <div className="relative">
              <Input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-primary transition-colors z-10"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
              >
                {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button onClick={handleChangePassword} disabled={changePassMut.isPending} variant="secondary" className="rounded-xl font-bold">
            <Save className="mr-2 h-4 w-4" />
            {changePassMut.isPending ? "Changing..." : "Change Password"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Toggle dark theme</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
