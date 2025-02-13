"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase/client";
import { checkClientPermission } from "@/utils/permissionUtils";

const SettingsPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasCreateCompanyPermission, setHasCreateCompanyPermission] =
    useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    marketingEmails: true,
  });

  useEffect(() => {
    const checkCreateCompanyPermission = async () => {
      try {
        const hasPermission = await checkClientPermission("create_company");
        setHasCreateCompanyPermission(hasPermission);
      } catch (error) {
        console.error("Error checking permission:", error);
        setHasCreateCompanyPermission(false);
      }
    };
    checkCreateCompanyPermission();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setFormData((prev) => ({
          ...prev,
          email: user.email || "",
          fullName: user.user_metadata?.full_name || "",
        }));
      }
    };

    getUser();
  }, [supabase.auth]);

  const updateProfile = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({
        email: formData.email,
        data: { full_name: formData.fullName },
      });

      if (error) throw error;
      toast({
        title: "✅ Erfolg",
        description: "Profil erfolgreich aktualisiert!",
        variant: "default",
        className: "border-green-500",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren des Profils!",
        className: "border-red-500",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Fehler",
        description: "Die Passwörter stimmen nicht überein!",
        className: "border-red-500",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Fehler",
        description: "Das Passwort muss mindestens 6 Zeichen lang sein!",
        className: "border-red-500",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) throw error;
      toast({
        title: "✅ Erfolg",
        description: "Passwort erfolgreich aktualisiert!",
        variant: "default",
        className: "border-green-500",
      });
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren des Passworts!",
        className: "border-red-500",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl space-y-6 py-6">
      <h1 className="text-3xl font-bold">Einstellungen</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profil Einstellungen</CardTitle>
          <CardDescription>
            Aktualisieren Sie Ihre Profilinformationen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Vollständiger Name</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fullName: e.target.value }))
              }
              placeholder="Geben Sie Ihren vollständigen Namen ein"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Geben Sie Ihre E-Mail-Adresse ein"
            />
          </div>
          <Button onClick={updateProfile} disabled={isLoading}>
            {isLoading ? "Aktualisieren..." : "Profil aktualisieren"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Passwort ändern</CardTitle>
          <CardDescription>Aktualisieren Sie Ihr Passwort</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Neues Passwort</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Neues Passwort bestätigen</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
            />
          </div>
          <Button
            onClick={updatePassword}
            disabled={
              isLoading ||
              !formData.currentPassword ||
              !formData.newPassword ||
              !formData.confirmPassword
            }
          >
            {isLoading ? "Aktualisieren..." : "Passwort ändern"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Einstellungen</CardTitle>
          <CardDescription>
            Verwalten Sie Ihre Anwendungseinstellungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing-E-Mails</Label>
              <p className="text-sm text-muted-foreground">
                Erhalten Sie E-Mails über neue Funktionen und Updates
              </p>
            </div>
            <Switch
              checked={formData.marketingEmails}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, marketingEmails: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
