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
import { FormError } from "@/components/ui/form-error";

interface FormErrors {
  firstname?: string;
  lastname?: string;
  email?: string;
}

const SettingsPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [hasCreateCompanyPermission, setHasCreateCompanyPermission] =
    useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
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
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) throw authError;

        if (user) {
          // Get user profile data
          const { data: profileData, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError) throw profileError;

          if (profileData) {
            setFormData((prev) => ({
              ...prev,
              email: user.email || "",
              firstname: profileData.firstname || "",
              lastname: profileData.lastname || "",
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der Benutzerdaten",
          className: "border-red-500",
        });
      }
    };

    getUser();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstname.trim()) {
      newErrors.firstname = "Vorname ist erforderlich";
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = "Nachname ist erforderlich";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-Mail ist erforderlich";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ungültige E-Mail-Adresse";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (!user) {
        throw new Error("Kein Benutzer gefunden");
      }

      // Update auth email if changed
      if (user.email !== formData.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });
        if (emailError) throw emailError;
      }

      // Update profile data
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          firstname: formData.firstname,
          lastname: formData.lastname,
          email: formData.email,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast({
        title: "✅ Erfolg",
        description: "Profil erfolgreich aktualisiert!",
        variant: "default",
        className: "border-green-500",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
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
          <div className="flex gap-4">
            <div className="w-full space-y-2">
              <Label htmlFor="firstname">Vorname*</Label>
              <Input
                id="firstname"
                value={formData.firstname}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    firstname: e.target.value,
                  }));
                  if (errors.firstname) {
                    const { firstname, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
                className={errors.firstname ? "border-red-500" : ""}
                placeholder="Geben Sie Ihren Vornamen ein"
              />
              {errors.firstname && <FormError message={errors.firstname} />}
            </div>
            <div className="w-full space-y-2">
              <Label htmlFor="lastname">Nachname*</Label>
              <Input
                id="lastname"
                value={formData.lastname}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    lastname: e.target.value,
                  }));
                  if (errors.lastname) {
                    const { lastname, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
                className={errors.lastname ? "border-red-500" : ""}
                placeholder="Geben Sie Ihren Nachnamen ein"
              />
              {errors.lastname && <FormError message={errors.lastname} />}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail*</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, email: e.target.value }));
                if (errors.email) {
                  const { email, ...rest } = errors;
                  setErrors(rest);
                }
              }}
              className={errors.email ? "border-red-500" : ""}
              placeholder="Geben Sie Ihre E-Mail-Adresse ein"
            />
            {errors.email && <FormError message={errors.email} />}
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
