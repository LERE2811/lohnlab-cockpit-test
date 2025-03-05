"use client";

import { useOnboarding } from "@/context/onboarding-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddressStep() {
  const { formData, updateFormData } = useOnboarding();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="street">Straße*</Label>
          <Input
            id="street"
            value={formData.address.street}
            onChange={(e) =>
              updateFormData("address", { street: e.target.value })
            }
            placeholder="Straße"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="house-number">Hausnummer*</Label>
          <Input
            id="house-number"
            value={formData.address.house_number}
            onChange={(e) =>
              updateFormData("address", { house_number: e.target.value })
            }
            placeholder="Hausnummer"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="postal-code">Postleitzahl*</Label>
          <Input
            id="postal-code"
            value={formData.address.postal_code}
            onChange={(e) =>
              updateFormData("address", { postal_code: e.target.value })
            }
            placeholder="PLZ"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Ort*</Label>
          <Input
            id="city"
            value={formData.address.city}
            onChange={(e) =>
              updateFormData("address", { city: e.target.value })
            }
            placeholder="Ort"
            required
          />
        </div>
      </div>
    </div>
  );
}
