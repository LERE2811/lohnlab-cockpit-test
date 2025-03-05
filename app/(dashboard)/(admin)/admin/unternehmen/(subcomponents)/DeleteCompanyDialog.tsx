"use client";

import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Company } from "@/shared/model";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DeleteCompanyDialogProps {
  company: Company;
  onCompanyDeleted: () => void;
}

export const DeleteCompanyDialog = ({
  company,
  onCompanyDeleted,
}: DeleteCompanyDialogProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "✅ Erfolg",
          description: "Unternehmen wurde erfolgreich gelöscht",
          variant: "default",
          className: "border-green-500",
        });
        setIsOpen(false);
        onCompanyDeleted();
        router.refresh();
      } else {
        const errorData = await response.json();
        toast({
          title: "Fehler",
          description:
            errorData.error || "Fehler beim Löschen des Unternehmens",
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
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-100 hover:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Löschen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unternehmen löschen</DialogTitle>
          <DialogDescription>
            Sind Sie sicher, dass Sie das Unternehmen{" "}
            <strong>{company.name}</strong> löschen möchten? Diese Aktion kann
            nicht rückgängig gemacht werden und löscht auch alle zugehörigen
            Daten wie Ansprechpartner und Gesellschaften.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Abbrechen
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gelöscht...
              </>
            ) : (
              "Löschen"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
