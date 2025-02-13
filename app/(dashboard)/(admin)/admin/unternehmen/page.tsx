"use server";
import { createClient } from "@/utils/supabase/server";
import { Company } from "@/shared/model";
import { getUserProfile } from "@/utils/supabaseUtils";
import { CompanyTable } from "./(subcomponents)/CompanyTable";
import { CreateCompanyDialog } from "./(subcomponents)/CreateCompanyDialog";

const AdminUnternehmenPage = async () => {
  const supabase = await createClient();

  const userProfile = await getUserProfile();

  if (userProfile?.role !== "Admin") {
    return <div>Keine Berechtigung</div>;
  }

  const { data, error } = await supabase.from("companies").select("*");

  if (error) {
    console.error(error);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Unternehmen</h1>
        <CreateCompanyDialog />
      </div>
      <CompanyTable companies={data} />
    </div>
  );
};

export default AdminUnternehmenPage;
