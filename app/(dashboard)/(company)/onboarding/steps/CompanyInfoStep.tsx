"use client";

import { useState } from "react";
import { useOnboarding } from "@/context/onboarding-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function CompanyInfoStep() {
  const { formData, updateFormData, saveProgress } = useOnboarding();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    formData.companyInfo.logo_url || null,
  );

  // Funktion zum Hochladen des Logos
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);

    // Erstelle eine Vorschau des Bildes
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Hier würde normalerweise der Upload zu einem Speicherdienst erfolgen
    // Für dieses Beispiel speichern wir nur die Datei-URL
    // In einer realen Anwendung würde hier der Upload zu Supabase Storage erfolgen
    updateFormData("companyInfo", {
      logo_url: URL.createObjectURL(file),
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="company-name">Unternehmensname*</Label>
        <Input
          id="company-name"
          value={formData.companyInfo.name}
          onChange={(e) =>
            updateFormData("companyInfo", { name: e.target.value })
          }
          placeholder="Name Ihres Unternehmens"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax-number">Steuernummer*</Label>
        <Input
          id="tax-number"
          value={formData.companyInfo.tax_number}
          onChange={(e) =>
            updateFormData("companyInfo", { tax_number: e.target.value })
          }
          placeholder="z.B. 123/456/78901"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Firmenlogo</Label>
        <div className="flex items-center gap-4">
          {logoPreview && (
            <div className="h-24 w-24 overflow-hidden rounded-md border">
              <img
                src={logoPreview}
                alt="Firmenlogo Vorschau"
                className="h-full w-full object-contain"
              />
            </div>
          )}
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("logo-upload")?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Logo hochladen
            </Button>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Empfohlene Größe: 200x200 Pixel, max. 2MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
