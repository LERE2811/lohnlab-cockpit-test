import { createClient } from "@/utils/supabase/server";
import UserTable from "./(subcomponents)/UserTable";
import InviteUserDialog from "./(subcomponents)/InviteUserDialog";
const UserManagementPage = async () => {
  const supabase = await createClient();
  const { data: users, error } = await supabase
    .from("user_profiles")
    .select("*");
  if (error) {
    console.error(error);
  }

  //Get company_users
  // we are using the company_users to get the company_id for each user
  const { data: company_users, error: company_users_error } = await supabase
    .from("company_users")
    .select("*");
  if (company_users_error) {
    console.error(company_users_error);
  }

  //Get companies
  const { data: companies, error: companies_error } = await supabase
    .from("companies")
    .select("*");
  if (companies_error) {
    console.error(companies_error);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Benutzerverwaltung</h1>
        <InviteUserDialog companies={companies || []} />
      </div>
      <UserTable
        users={users || []}
        company_users={company_users || []}
        companies={companies || []}
      />
    </div>
  );
};

export default UserManagementPage;
