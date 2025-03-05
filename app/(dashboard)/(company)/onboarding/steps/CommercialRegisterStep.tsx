"use client";

import { useState } from "react";
import { useOnboarding } from "@/context/onboarding-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, FileText } from "lucide-react";

export default function CommercialRegisterStep() {
  const { formData, updateFormData } = useOnboarding();
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(
    formData.commercialRegister.commercial_register_file_url
      ? formData.commercialRegister.commercial_register_file_url
          .split("/")
          .pop() || null
      : null,
  );

  // Funktion zum Hochladen des Handelsregisterauszugs
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    setFileName(file.name);

    // Hier würde normalerweise der Upload zu einem Speicherdienst erfolgen
    // Für dieses Beispiel speichern wir nur den Dateinamen
    // In einer realen Anwendung würde hier der Upload zu Supabase Storage erfolgen
    updateFormData("commercialRegister", {
      commercial_register_file_url: URL.createObjectURL(file),
    });
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
            </div>
          )}
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Datei hochladen
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
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
