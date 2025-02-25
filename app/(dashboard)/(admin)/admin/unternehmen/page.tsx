"use server";
import { createClient } from "@/utils/supabase/server";
import { Company } from "@/shared/model";
import { getUserProfile } from "@/utils/supabaseUtils";
import { CompanyTable } from "./(subcomponents)/CompanyTable";
import { CreateCompanyDialog } from "./(subcomponents)/CreateCompanyDialog";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Loading component
function LoadingState() {
  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Daten werden geladen...</p>
    </div>
  );
}

// Content component
async function CompanyManagementContent() {
  const supabase = await createClient();

  const userProfile = await getUserProfile();

  if (userProfile?.role !== "Admin") {
    return <div>Keine Berechtigung</div>;
  }

  const { data, error } = await supabase.from("companies").select("*");

  // we need to fetch the ansprechpartner for each company
  const { data: ansprechpartnerData, error: ansprechpartnerError } =
    await supabase.from("ansprechpartner").select("*");

  if (ansprechpartnerError) {
    console.error(ansprechpartnerError);
  }

  if (error) {
    console.error(error);
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center">
        <p className="text-red-500">Fehler beim Laden der Daten</p>
      </div>
    );
  }

  return (
    <CompanyTable companies={data} ansprechpartnerData={ansprechpartnerData} />
  );
}

const AdminUnternehmenPage = async () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Unternehmen</h1>
        <CreateCompanyDialog />
      </div>
      <Suspense fallback={<LoadingState />}>
        <CompanyManagementContent />
      </Suspense>
    </div>
  );
};

export default AdminUnternehmenPage;
