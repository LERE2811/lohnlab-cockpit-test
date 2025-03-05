"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Ansprechpartner, Company, Vertriebspartner } from "@/shared/model";
import { Loader2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

interface FormErrors {
  name?: string;
  vertriebspartner?: string;
  ansprechpartnerFirstname?: string;
  ansprechpartnerLastname?: string;
  ansprechpartnerEmail?: string;
}

interface EditCompanyDialogProps {
  company: Company;
  ansprechpartner: Ansprechpartner | null;
  onCompanyUpdated: () => void;
}

export const EditCompanyDialog = ({
  company,
  ansprechpartner,
  onCompanyUpdated,
}: EditCompanyDialogProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Get the key for a vertriebspartner value
  const getVertriebspartnerKey = (value: string): string => {
    const entry = Object.entries(Vertriebspartner).find(
      ([_, val]) => val === value,
    );
    return entry ? entry[0] : "";
  };

  // Form state
  const [name, setName] = useState(company.name || "");
  const [vertriebspartner, setVertriebspartner] = useState<string>(
    getVertriebspartnerKey(company.vertriebspartner) || "",
  );
  const [ansprechpartnerFirstname, setAnsprechpartnerFirstname] = useState(
    ansprechpartner?.firstname || "",
  );
  const [ansprechpartnerLastname, setAnsprechpartnerLastname] = useState(
    ansprechpartner?.lastname || "",
  );
  const [ansprechpartnerEmail, setAnsprechpartnerEmail] = useState(
    ansprechpartner?.email || "",
  );

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name ist erforderlich";
    }

    if (!vertriebspartner) {
      newErrors.vertriebspartner = "Vertriebspartner ist erforderlich";
    }

    if (
      ansprechpartnerFirstname.trim() ||
      ansprechpartnerLastname.trim() ||
      ansprechpartnerEmail.trim()
    ) {
      // If any ansprechpartner field is filled, validate all of them
      if (!ansprechpartnerFirstname.trim()) {
        newErrors.ansprechpartnerFirstname = "Vorname ist erforderlich";
      }

      if (!ansprechpartnerLastname.trim()) {
        newErrors.ansprechpartnerLastname = "Nachname ist erforderlich";
      }

      if (!ansprechpartnerEmail.trim()) {
        newErrors.ansprechpartnerEmail = "E-Mail ist erforderlich";
      } else if (!validateEmail(ansprechpartnerEmail)) {
        newErrors.ansprechpartnerEmail = "Ungültige E-Mail-Adresse";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          vertriebspartner:
            Vertriebspartner[vertriebspartner as keyof typeof Vertriebspartner],
          ansprechpartner: {
            firstname: ansprechpartnerFirstname,
            lastname: ansprechpartnerLastname,
            email: ansprechpartnerEmail,
          },
        }),
      });

      if (response.ok) {
        toast({
          title: "✅ Erfolg",
          description: "Unternehmen wurde erfolgreich aktualisiert",
          variant: "default",
          className: "border-green-500",
        });
        setIsOpen(false);
        onCompanyUpdated();
        router.refresh();
      } else {
        const errorData = await response.json();
        toast({
          title: "Fehler",
          description:
            errorData.error || "Fehler beim Aktualisieren des Unternehmens",
          className: "border-red-500",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Fehler",
        description: "Ein unerwarteter Fehler ist aufgetreten",
        className: "border-red-500",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <Pencil className="mr-2 h-4 w-4" />
          Bearbeiten
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Unternehmen bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Unternehmensname*</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vertriebspartner">Vertriebspartner*</Label>
            <Select
              value={vertriebspartner}
              onValueChange={(value) => {
                setVertriebspartner(value);
                if (errors.vertriebspartner) {
                  setErrors((prev) => ({
                    ...prev,
                    vertriebspartner: undefined,
                  }));
                }
              }}
            >
              <SelectTrigger
                id="vertriebspartner"
                className={errors.vertriebspartner ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Vertriebspartner auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOHNLAB">
                  {Vertriebspartner.LOHNLAB}
                </SelectItem>
                <SelectItem value="LOHNKONZEPT">
                  {Vertriebspartner.LOHNKONZEPT}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.vertriebspartner && (
              <p className="text-xs text-red-500">{errors.vertriebspartner}</p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Ansprechpartner</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="ansprechpartnerFirstname">Vorname</Label>
                <Input
                  id="ansprechpartnerFirstname"
                  value={ansprechpartnerFirstname}
                  onChange={(e) => {
                    setAnsprechpartnerFirstname(e.target.value);
                    if (errors.ansprechpartnerFirstname) {
                      setErrors((prev) => ({
                        ...prev,
                        ansprechpartnerFirstname: undefined,
                      }));
                    }
                  }}
                  className={
                    errors.ansprechpartnerFirstname ? "border-red-500" : ""
                  }
                />
                {errors.ansprechpartnerFirstname && (
                  <p className="text-xs text-red-500">
                    {errors.ansprechpartnerFirstname}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ansprechpartnerLastname">Nachname</Label>
                <Input
                  id="ansprechpartnerLastname"
                  value={ansprechpartnerLastname}
                  onChange={(e) => {
                    setAnsprechpartnerLastname(e.target.value);
                    if (errors.ansprechpartnerLastname) {
                      setErrors((prev) => ({
                        ...prev,
                        ansprechpartnerLastname: undefined,
                      }));
                    }
                  }}
                  className={
                    errors.ansprechpartnerLastname ? "border-red-500" : ""
                  }
                />
                {errors.ansprechpartnerLastname && (
                  <p className="text-xs text-red-500">
                    {errors.ansprechpartnerLastname}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ansprechpartnerEmail">E-Mail</Label>
              <Input
                id="ansprechpartnerEmail"
                type="email"
                value={ansprechpartnerEmail}
                onChange={(e) => {
                  setAnsprechpartnerEmail(e.target.value);
                  if (errors.ansprechpartnerEmail) {
                    setErrors((prev) => ({
                      ...prev,
                      ansprechpartnerEmail: undefined,
                    }));
                  }
                }}
                className={errors.ansprechpartnerEmail ? "border-red-500" : ""}
              />
              {errors.ansprechpartnerEmail && (
                <p className="text-xs text-red-500">
                  {errors.ansprechpartnerEmail}
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              "Speichern"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
