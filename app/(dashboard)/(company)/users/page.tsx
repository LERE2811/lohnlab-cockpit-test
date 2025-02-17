// TODO: Add a table of all users in the company
// TODO: Add a form to add a new user to the company
// TODO: Add a form to edit a user in the company
// TODO: Add a form to delete a user from the company
"use client";
import { supabase } from "@/utils/supabase/client";
import { useCompany } from "@/context/company-context";
import { useEffect, useState } from "react";
import { CompanyUser, UserProfile } from "@/shared/model";
import UserTable from "./(subcomponents)/UserTable";
import InviteCompanyUserDialog from "./(subcomponents)/InviteCompanyUserDialog";

const CompanyUsersPage = () => {
  const { company } = useCompany();
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  // get all company users
  useEffect(() => {
    const fetchCompanyUsers = async () => {
      const { data: companyUsers } = await supabase
        .from("company_users")
        .select("*")
        .eq("company_id", company?.id);

      setCompanyUsers(companyUsers || []);

      // also fetch the users for the company users
      const { data: users } = await supabase
        .from("user_profiles")
        .select("*")
        .in("id", companyUsers?.map((user) => user.user_id) || []);

      setUsers(users || []);
    };

    fetchCompanyUsers();
  }, [company]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">Benutzer von {company?.name}</h1>
        <InviteCompanyUserDialog />
      </div>
      <UserTable companyUsers={companyUsers} users={users} />
    </div>
  );
};

export default CompanyUsersPage;
