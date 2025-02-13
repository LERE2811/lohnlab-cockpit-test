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
import { supabase } from "@/utils/supabase/client";
import { Vertriebspartner } from "@/shared/model";

interface CompanyFormData {
  name: string;
  vertriebspartner: string;
}

export const CreateCompanyDialog = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    vertriebspartner: "",
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.vertriebspartner) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Felder aus.",
        className: "border-red-500",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.from("companies").insert([
        {
          name: formData.name,
          vertriebspartner: formData.vertriebspartner,
        },
      ]);

      if (error) throw error;

      toast({
        title: "✅ Erfolg",
        description: "Unternehmen erfolgreich erstellt!",
        variant: "default",
        className: "border-green-500",
      });
      setOpen(false);
      // Reset form
      setFormData({ name: "", vertriebspartner: "" });
    } catch (error) {
      console.error("Error creating company:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen des Unternehmens.",
        className: "border-red-500",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Unternehmen erstellen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neues Unternehmen erstellen</DialogTitle>
          <DialogDescription>
            Fügen Sie ein neues Unternehmen hinzu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name des Unternehmens</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Geben Sie den Namen des Unternehmens ein"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vertriebspartner">Vertriebspartner</Label>
            <Select
              value={formData.vertriebspartner}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, vertriebspartner: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie einen Vertriebspartner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Vertriebspartner.LOHNLAB}>
                  {Vertriebspartner.LOHNLAB}
                </SelectItem>
                <SelectItem value={Vertriebspartner.LOHNKONZEPT}>
                  {Vertriebspartner.LOHNKONZEPT}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Erstellen..." : "Erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
