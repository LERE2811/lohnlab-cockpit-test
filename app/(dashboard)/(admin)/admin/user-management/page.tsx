import { createClient } from "@/utils/supabase/server";
import UserTable from "./(subcomponents)/UserTable";
import InviteUserDialog from "./(subcomponents)/InviteUserDialog";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

// Loading state component
const LoadingState = () => {
  return (
    <div className="flex h-40 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Lade Benutzerdaten...</p>
      </div>
    </div>
  );
};

// Component to handle data fetching
const UserManagementContent = async () => {
  const supabase = await createClient();
  const { data: users, error } = await supabase
    .from("user_profiles")
    .select("*");
  if (error) {
    console.error(error);
    return <div>Fehler beim Laden der Benutzerdaten</div>;
  }

  //Get company_users
  // we are using the company_users to get the company_id for each user
  const { data: company_users, error: company_users_error } = await supabase
    .from("company_users")
    .select("*");
  if (company_users_error) {
    console.error(company_users_error);
    return <div>Fehler beim Laden der Unternehmenszuordnungen</div>;
  }

  //Get companies
  const { data: companies, error: companies_error } = await supabase
    .from("companies")
    .select("*");
  if (companies_error) {
    console.error(companies_error);
    return <div>Fehler beim Laden der Unternehmensdaten</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Benutzerverwaltung</h1>
        <InviteUserDialog companies={companies || []} />
      </div>
      <UserTable
        users={users || []}
        company_users={company_users || []}
        companies={companies || []}
      />
    </>
  );
};

// Main page component with Suspense
const UserManagementPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<LoadingState />}>
        <UserManagementContent />
      </Suspense>
    </div>
  );
};

export default UserManagementPage;
