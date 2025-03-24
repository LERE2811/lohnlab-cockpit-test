"use client";

import { StepLayout } from "../components/StepLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckSquare, FileWarning, Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGivveOnboarding } from "../context/givve-onboarding-context";
import { useState } from "react";

export const SignedFormsStep = () => {
  const { saveProgress } = useGivveOnboarding();
  const [bestellformularFile, setBestellformularFile] = useState<string | null>(
    null,
  );
  const [dokumentationsbogenFile, setDokumentationsbogenFile] = useState<
    string | null
  >(null);

  const handleContinue = async () => {
    await saveProgress({});
  };

  // Handle file uploads
  const handleBestellformularUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setBestellformularFile(file.name);
    }
  };

  const handleDokumentationsbogenUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setDokumentationsbogenFile(file.name);
    }
  };

  return (
    <StepLayout
      title="Formulare unterschrieben"
      description="Laden Sie die unterschriebenen Dokumente hoch"
      onSave={handleContinue}
    >
      <div className="space-y-6">
        <Alert
          variant="default"
          className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
        >
          <FileWarning className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Dies ist ein Platzhalter. Die vollständige Funktionalität folgt in
            weiteren Updates.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CheckSquare className="mr-2 h-5 w-5 text-primary" />
              Unterschriebene Dokumente hochladen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-6 text-sm leading-relaxed text-foreground">
              <p>
                Bitte laden Sie die unterschriebenen Dokumente hoch. Die
                Dokumente werden anschließend an givve® weitergeleitet.
              </p>
            </CardDescription>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">Bestellformular</p>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("bestellformular-upload")?.click()
                    }
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Bestellformular hochladen
                  </Button>
                  <input
                    type="file"
                    id="bestellformular-upload"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleBestellformularUpload}
                  />
                  {bestellformularFile && (
                    <div className="text-sm text-muted-foreground">
                      {bestellformularFile}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Dokumentationsbogen</p>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document
                        .getElementById("dokumentationsbogen-upload")
                        ?.click()
                    }
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Dokumentationsbogen hochladen
                  </Button>
                  <input
                    type="file"
                    id="dokumentationsbogen-upload"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleDokumentationsbogenUpload}
                  />
                  {dokumentationsbogenFile && (
                    <div className="text-sm text-muted-foreground">
                      {dokumentationsbogenFile}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StepLayout>
  );
};
