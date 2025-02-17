import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompany } from "@/context/company-context";
import { toast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";
import { useState } from "react";

const InviteCompanyUserDialog = () => {
  const { company } = useCompany();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate firstname
    if (!firstname.trim()) {
      newErrors.firstname = "Vorname ist erforderlich";
    } else if (firstname.length < 2) {
      newErrors.firstname = "Vorname muss mindestens 2 Zeichen lang sein";
    }

    // Validate lastname
    if (!lastname.trim()) {
      newErrors.lastname = "Nachname ist erforderlich";
    } else if (lastname.length < 2) {
      newErrors.lastname = "Nachname muss mindestens 2 Zeichen lang sein";
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = "E-Mail ist erforderlich";
    } else if (!validateEmail(email)) {
      newErrors.email = "Bitte geben Sie eine gültige E-Mail-Adresse ein";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFirstname("");
    setLastname("");
    setEmail("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!company) {
      toast({
        title: "Fehler",
        description: "Kein Unternehmen ausgewählt",
        className: "border-red-500",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          role: "User",
          company: company.id,
          firstname,
          lastname,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Fehler beim Einladen des Benutzers",
        );
      }

      toast({
        title: "✅ Erfolg",
        description: "Benutzer wurde erfolgreich eingeladen",
        variant: "default",
        className: "border-green-500",
      });

      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        title: "Fehler",
        description:
          error instanceof Error
            ? error.message
            : "Ein unerwarteter Fehler ist aufgetreten",
        className: "border-red-500",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Neuer Benutzer
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuer Benutzer</DialogTitle>
          <DialogDescription>
            Laden Sie einen neuen Benutzer für {company?.name} ein.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex gap-2">
              <div className="w-full space-y-2">
                <Label htmlFor="firstname">Vorname*</Label>
                <Input
                  placeholder="Vorname eingeben"
                  id="firstname"
                  type="text"
                  className={errors.firstname ? "border-red-500" : ""}
                  value={firstname}
                  onChange={(e) => {
                    setFirstname(e.target.value);
                    if (errors.firstname) {
                      const { firstname, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}
                />
                {errors.firstname && <FormError message={errors.firstname} />}
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="lastname">Nachname*</Label>
                <Input
                  placeholder="Nachname eingeben"
                  id="lastname"
                  type="text"
                  className={errors.lastname ? "border-red-500" : ""}
                  value={lastname}
                  onChange={(e) => {
                    setLastname(e.target.value);
                    if (errors.lastname) {
                      const { lastname, ...rest } = errors;
                      setErrors(rest);
                    }
                  }}
                />
                {errors.lastname && <FormError message={errors.lastname} />}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail*</Label>
              <Input
                placeholder="Email eingeben"
                id="email"
                type="email"
                className={errors.email ? "border-red-500" : ""}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    const { email, ...rest } = errors;
                    setErrors(rest);
                  }
                }}
              />
              {errors.email && <FormError message={errors.email} />}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Wird eingeladen..." : "Einladen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteCompanyUserDialog;
