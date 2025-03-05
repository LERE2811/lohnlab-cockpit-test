"use client";

import { useState, useEffect } from "react";
import { useOnboarding } from "@/context/onboarding-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Upload } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCompany } from "@/context/company-context";

export default function CommercialRegisterStep() {
  const { formData, updateFormData, saveProgress } = useOnboarding();
  const { company } = useCompany();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load file name when component mounts or formData changes
  useEffect(() => {
    const loadFileInfo = async () => {
      if (formData.commercialRegister.commercial_register_file_url) {
        try {
          // Extract the path from the stored URL
          const path = formData.commercialRegister.commercial_register_file_url;

          // If it's a path to a file in the bucket
          if (path.includes("commercial_register_documents/")) {
            // Get the file name from the path
            const fileNameFromPath = path.split("/").pop();
            if (fileNameFromPath) {
              setFileName(fileNameFromPath);
            }
          }
        } catch (error) {
          console.error("Error parsing file path:", error);
        }
      } else {
        // Reset filename when there's no file URL
        setFileName(null);
      }
    };

    loadFileInfo();
  }, [formData.commercialRegister.commercial_register_file_url, company?.id]);

  // Funktion zum Hochladen des Handelsregisterauszugs
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Überprüfe die Dateigröße (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fehler",
        description: "Die Datei ist zu groß. Maximale Größe: 5MB",
        className: "border-red-500",
      });
      return;
    }

    setFile(file);
    setFileName(file.name);
    setIsUploading(true);

    try {
      // Generiere einen eindeutigen Dateinamen
      const fileExt = file.name.split(".").pop();
      const fileName = `${company.id}_register_${Date.now()}.${fileExt}`;

      // Upload zur Supabase Storage
      const { data, error } = await supabase.storage
        .from("commercial_register_documents")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) throw error;

      // Store the path to the file instead of a public URL
      const filePath = `commercial_register_documents/${fileName}`;

      // Aktualisiere die Formulardaten mit dem Dateipfad
      updateFormData("commercialRegister", {
        commercial_register_file_url: filePath,
      });

      // Speichere den Fortschritt
      await saveProgress();

      toast({
        title: "Erfolg",
        description: "Handelsregisterauszug wurde erfolgreich hochgeladen",
        className: "border-green-500",
      });
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Fehler",
        description: "Beim Hochladen des Dokuments ist ein Fehler aufgetreten",
        className: "border-red-500",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Funktion zum Herunterladen des Dokuments
  const handleDownloadDocument = async () => {
    if (!formData.commercialRegister.commercial_register_file_url) return;

    try {
      const path = formData.commercialRegister.commercial_register_file_url;

      // If it's a path to a file in the bucket
      if (path.includes("commercial_register_documents/")) {
        // Get the file name from the path
        const fileNameFromPath = path.split("/").pop();
        if (!fileNameFromPath) return;

        // Generate a signed URL that expires in 1 hour
        const { data, error } = await supabase.storage
          .from("commercial_register_documents")
          .createSignedUrl(fileNameFromPath, 3600);

        if (error) {
          console.error("Error creating signed URL:", error);
          toast({
            title: "Fehler",
            description: "Dokument konnte nicht heruntergeladen werden",
            className: "border-red-500",
          });
          return;
        }

        if (data?.signedUrl) {
          // Open the signed URL in a new tab
          window.open(data.signedUrl, "_blank");
        }
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Fehler",
        description:
          "Beim Herunterladen des Dokuments ist ein Fehler aufgetreten",
        className: "border-red-500",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="commercial-register">Handelsregister*</Label>
        <Input
          id="commercial-register"
          value={formData.commercialRegister.commercial_register}
          onChange={(e) =>
            updateFormData("commercialRegister", {
              commercial_register: e.target.value,
            })
          }
          placeholder="z.B. Amtsgericht München"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="commercial-register-number">
          Handelsregisternummer*
        </Label>
        <Input
          id="commercial-register-number"
          value={formData.commercialRegister.commercial_register_number}
          onChange={(e) =>
            updateFormData("commercialRegister", {
              commercial_register_number: e.target.value,
            })
          }
          placeholder="z.B. HRB 123456"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="commercial-register-file">Handelsregisterauszug</Label>
        <div className="flex items-center gap-4">
          {fileName && (
            <div className="flex items-center gap-2 rounded-md border p-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{fileName}</span>
              {formData.commercialRegister.commercial_register_file_url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-6 px-2"
                  onClick={handleDownloadDocument}
                >
                  Anzeigen
                </Button>
              )}
            </div>
          )}
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
              className="flex items-center gap-2"
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {isUploading ? "Wird hochgeladen..." : "Datei hochladen"}
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Akzeptierte Formate: PDF, JPG, PNG (max. 5MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
