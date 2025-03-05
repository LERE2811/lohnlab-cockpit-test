"use client";

import { useState, useEffect } from "react";
import { useOnboarding } from "@/context/onboarding-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/context/company-context";

export default function CompanyInfoStep() {
  const { formData, updateFormData, saveProgress } = useOnboarding();
  const { company } = useCompany();
  const { toast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load logo preview when component mounts or formData changes
  useEffect(() => {
    const loadLogoPreview = async () => {
      if (formData.companyInfo.logo_url) {
        try {
          // Extract the path from the stored URL
          const path = formData.companyInfo.logo_url;

          // If it's a path to a file in the bucket
          if (path.includes("company_logos/")) {
            // Get the file name from the path
            const fileName = path.split("/").pop();

            // Generate a signed URL that expires in 1 hour
            const { data, error } = await supabase.storage
              .from("company_logos")
              .createSignedUrl(fileName || "", 3600);

            if (error) {
              console.error("Error creating signed URL:", error);
              return;
            }

            if (data?.signedUrl) {
              setLogoPreview(data.signedUrl);
            }
          }
        } catch (error) {
          console.error("Error loading logo preview:", error);
        }
      } else {
        // Reset preview when there's no logo URL
        setLogoPreview(null);
      }
    };

    loadLogoPreview();
  }, [formData.companyInfo.logo_url, company?.id]);

  // Funktion zum Hochladen des Logos
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!company) {
      toast({
        title: "Fehler",
        description: "Unternehmensdaten konnten nicht geladen werden",
        className: "border-red-500",
      });
      return;
    }

    // Überprüfe die Dateigröße (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Fehler",
        description: "Die Datei ist zu groß. Maximale Größe: 2MB",
        className: "border-red-500",
      });
      return;
    }

    setLogoFile(file);
    setIsUploading(true);

    try {
      // Erstelle eine Vorschau des Bildes
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Generiere einen eindeutigen Dateinamen
      const fileExt = file.name.split(".").pop();
      const fileName = `${company.id}_logo_${Date.now()}.${fileExt}`;

      // Upload zur Supabase Storage
      const { data, error } = await supabase.storage
        .from("company_logos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      // Store the path to the file instead of a public URL
      const filePath = `company_logos/${fileName}`;

      // Generate a signed URL for immediate preview
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("company_logos")
          .createSignedUrl(fileName, 3600);

      if (signedUrlError) {
        console.error("Error creating signed URL:", signedUrlError);
      } else if (signedUrlData?.signedUrl) {
        setLogoPreview(signedUrlData.signedUrl);
      }

      // Aktualisiere die Formulardaten mit dem Dateipfad
      updateFormData("companyInfo", {
        logo_url: filePath,
      });

      // Speichere den Fortschritt
      await saveProgress();

      toast({
        title: "Erfolg",
        description: "Logo wurde erfolgreich hochgeladen",
        className: "border-green-500",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Fehler",
        description: "Beim Hochladen des Logos ist ein Fehler aufgetreten",
        className: "border-red-500",
      });
    } finally {
      setIsUploading(false);
    }
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
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isUploading ? "Wird hochgeladen..." : "Logo hochladen"}
            </Button>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              disabled={isUploading}
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
