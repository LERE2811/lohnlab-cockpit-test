"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Company, UserProfile, CompanyUser } from "@/shared/model";
import { Loader2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { FormError } from "@/components/ui/form-error";

interface FormErrors {
  firstname?: string;
  lastname?: string;
  email?: string;
  role?: string;
  company?: string;
}

interface EditUserDialogProps {
  user: UserProfile;
  companies: Company[];
  companyUsers: CompanyUser[];
  onUserUpdated: () => void;
}

const EditUserDialog = ({
  user,
  companies,
  companyUsers,
  onUserUpdated,
}: EditUserDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<string>(user.role || "");
  const [email, setEmail] = useState<string>(user.email || "");
  const [firstname, setFirstname] = useState<string>(user.firstname || "");
  const [lastname, setLastname] = useState<string>(user.lastname || "");
  const [company, setCompany] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showCompanySelect = role === "User" || role === "Kundenbetreuer";

  // Set initial company value
  useEffect(() => {
    if (isOpen) {
      const userCompany = companyUsers.find((cu) => cu.user_id === user.id);
      if (userCompany) {
        setCompany(userCompany.company_id);
      }
    }
  }, [isOpen, user.id, companyUsers]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate firstname
    if (!firstname.trim()) {
      newErrors.firstname = "Vorname ist erforderlich";
    }

    // Validate lastname
    if (!lastname.trim()) {
      newErrors.lastname = "Nachname ist erforderlich";
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = "E-Mail ist erforderlich";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Ungültige E-Mail-Adresse";
    }

    // Validate role
    if (!role) {
      newErrors.role = "Rolle ist erforderlich";
    }

    // Validate company if role is User or Kundenbetreuer
    if (showCompanySelect && !company) {
      newErrors.company = "Unternehmen ist erforderlich";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname,
          lastname,
          email,
          role,
          company,
        }),
      });

      if (response.ok) {
        toast({
          title: "✅ Erfolg",
          description: "Benutzer wurde erfolgreich aktualisiert",
          variant: "default",
          className: "border-green-500",
        });
        setIsOpen(false);
        onUserUpdated();
      } else {
        const errorData = await response.json();
        toast({
          title: "Fehler",
          description:
            errorData.error || "Fehler beim Aktualisieren des Benutzers",
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Benutzer bearbeiten</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <div className="w-full space-y-2">
                <Label htmlFor="firstname">Vorname*</Label>
                <Input
                  placeholder="Vorname eingeben"
                  id="firstname"
                  type="text"
                  className={`w-full ${errors.firstname ? "border-red-500" : ""}`}
                  value={firstname}
                  onChange={(e) => {
                    setFirstname(e.target.value);
                    if (errors.firstname) {
                      setErrors((prev) => ({ ...prev, firstname: undefined }));
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
                  className={`w-full ${errors.lastname ? "border-red-500" : ""}`}
                  value={lastname}
                  onChange={(e) => {
                    setLastname(e.target.value);
                    if (errors.lastname) {
                      setErrors((prev) => ({ ...prev, lastname: undefined }));
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
                className={`w-full ${errors.email ? "border-red-500" : ""}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
              />
              {errors.email && <FormError message={errors.email} />}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rolle*</Label>
              <Select
                value={role}
                onValueChange={(value) => {
                  setRole(value);
                  if (errors.role) {
                    setErrors((prev) => ({ ...prev, role: undefined }));
                  }
                  // Clear company error if switching to Admin role
                  if (value === "Admin" && errors.company) {
                    setErrors((prev) => ({ ...prev, company: undefined }));
                  }
                }}
              >
                <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                  <SelectValue placeholder="Rolle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Kundenbetreuer">Kundenbetreuer</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <FormError message={errors.role} />}
            </div>
            {showCompanySelect && (
              <div className="space-y-2">
                <Label htmlFor="company">Unternehmen*</Label>
                <Select
                  value={company}
                  onValueChange={(value) => {
                    setCompany(value);
                    if (errors.company) {
                      setErrors((prev) => ({ ...prev, company: undefined }));
                    }
                  }}
                >
                  <SelectTrigger
                    className={errors.company ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Unternehmen auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.company && <FormError message={errors.company} />}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                "Speichern"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
