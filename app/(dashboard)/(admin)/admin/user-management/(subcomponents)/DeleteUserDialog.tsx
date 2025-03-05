"use client";
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
import { toast } from "@/hooks/use-toast";
import { UserProfile } from "@/shared/model";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

interface DeleteUserDialogProps {
  user: UserProfile;
  onUserDeleted: () => void;
}

const DeleteUserDialog = ({ user, onUserDeleted }: DeleteUserDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "✅ Erfolg",
          description: "Benutzer wurde erfolgreich gelöscht",
          variant: "default",
          className: "border-green-500",
        });
        setIsOpen(false);
        onUserDeleted();
      } else {
        const errorData = await response.json();
        toast({
          title: "Fehler",
          description: errorData.error || "Fehler beim Löschen des Benutzers",
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
          <DialogTitle>Benutzer löschen</DialogTitle>
          <DialogDescription>
            Sind Sie sicher, dass Sie den Benutzer{" "}
            <strong>
              {user.firstname} {user.lastname}
            </strong>{" "}
            ({user.email}) löschen möchten? Diese Aktion kann nicht rückgängig
            gemacht werden.
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

export default DeleteUserDialog;
