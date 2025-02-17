"use client";

// TODO: Create a Context to store the company id and subsidiary and the subsidary can be changed in the sidebar we can store that in the cookies

import { createContext, useContext, useState, useEffect } from "react";
import { Company, Subsidiary, CompanyUser, UserProfile } from "@/shared/model";
import { useUser } from "./user-context";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Roles } from "@/shared/model";

// Cookie names
const COMPANY_COOKIE = "selected_company_id";
const SUBSIDIARY_COOKIE = "selected_subsidiary_id";

interface CompanyContextType {
  company: Company | null;
  subsidiary: Subsidiary | null;
  availableCompanies: Company[];
  availableSubsidiaries: Subsidiary[];
  setSelectedCompany: (company: Company | null) => Promise<void>;
  setSelectedSubsidiary: (subsidiary: Subsidiary | null) => void;
  isLoading: boolean;
}

export const CompanyContext = createContext<CompanyContextType>({
  company: null,
  subsidiary: null,
  availableCompanies: [],
  availableSubsidiaries: [],
  setSelectedCompany: async () => {},
  setSelectedSubsidiary: () => {},
  isLoading: true,
});

export const CompanyProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [company, setCompany] = useState<Company | null>(null);
  const [subsidiary, setSubsidiary] = useState<Subsidiary | null>(null);
  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  const [availableSubsidiaries, setAvailableSubsidiaries] = useState<
    Subsidiary[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();
  const { toast } = useToast();

  // Load saved selections from cookies
  const loadSavedSelections = async () => {
    if (!user) return;

    try {
      const savedCompanyId = document.cookie
        .split("; ")
        .find((row) => row.startsWith(COMPANY_COOKIE))
        ?.split("=")[1];

      const savedSubsidiaryId = document.cookie
        .split("; ")
        .find((row) => row.startsWith(SUBSIDIARY_COOKIE))
        ?.split("=")[1];

      if (savedCompanyId) {
        const { data: savedCompany } = await supabase
          .from("companies")
          .select("*")
          .eq("id", savedCompanyId)
          .single();

        if (savedCompany) {
          await setSelectedCompany(savedCompany);

          if (savedSubsidiaryId) {
            const { data: savedSubsidiary } = await supabase
              .from("subsidiaries")
              .select("*")
              .eq("id", savedSubsidiaryId)
              .eq("company_id", savedCompany.id)
              .single();

            if (savedSubsidiary) {
              setSelectedSubsidiary(savedSubsidiary);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading saved selections:", error);
    }
  };

  // Save selections to cookies
  const saveSelectionsToCookies = () => {
    if (company) {
      document.cookie = `${COMPANY_COOKIE}=${company.id}; path=/; max-age=604800`; // 7 days
    } else {
      document.cookie = `${COMPANY_COOKIE}=; path=/; max-age=0`;
    }

    if (subsidiary) {
      document.cookie = `${SUBSIDIARY_COOKIE}=${subsidiary.id}; path=/; max-age=604800`; // 7 days
    } else {
      document.cookie = `${SUBSIDIARY_COOKIE}=; path=/; max-age=0`;
    }
  };

  // Load saved selections when user is available
  useEffect(() => {
    loadSavedSelections();
  }, [user]);

  // Save selections when they change
  useEffect(() => {
    saveSelectionsToCookies();
  }, [company, subsidiary]);

  // Fetch available companies based on user role
  useEffect(() => {
    const fetchAvailableCompanies = async () => {
      if (!user) return;

      try {
        if (user.role === Roles.ADMIN) {
          // Admin can access all companies
          const { data, error } = await supabase.from("companies").select("*");

          if (error) throw error;
          setAvailableCompanies(data || []);

          // Only set first company if no saved selection
          if (data && data.length > 0 && !company) {
            await setSelectedCompany(data[0]);
          }
        } else if (user.role === Roles.KUNDENBETREUER) {
          // Kundenbetreuer can access companies they're assigned to
          const { data: companyUsers, error: companyUsersError } =
            await supabase
              .from("company_users")
              .select("company_id")
              .eq("user_id", user.id);

          if (companyUsersError) throw companyUsersError;

          if (companyUsers && companyUsers.length > 0) {
            const companyIds = companyUsers.map((cu) => cu.company_id);
            const { data: companies, error: companiesError } = await supabase
              .from("companies")
              .select("*")
              .in("id", companyIds);

            if (companiesError) throw companiesError;
            setAvailableCompanies(companies || []);

            // Automatically set first company for kundenbetreuer
            if (companies && companies.length > 0 && !company) {
              await setSelectedCompany(companies[0]);
            }
          }
        } else if (user.role === Roles.USER) {
          // Regular user can only access their assigned company
          const { data: companyUser, error: companyUserError } = await supabase
            .from("company_users")
            .select("company_id")
            .eq("user_id", user.id)
            .single();

          if (companyUserError) throw companyUserError;

          if (companyUser) {
            const { data: company, error: companyError } = await supabase
              .from("companies")
              .select("*")
              .eq("id", companyUser.company_id)
              .single();

            if (companyError) throw companyError;

            if (company) {
              setAvailableCompanies([company]);
              // Automatically set the company for user
              await setSelectedCompany(company);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching available companies:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der verfügbaren Unternehmen",
          className: "border-red-500",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableCompanies();
  }, [user]);

  // Fetch subsidiaries when company changes
  useEffect(() => {
    const fetchSubsidiaries = async () => {
      if (!company) {
        setAvailableSubsidiaries([]);
        setSubsidiary(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("subsidiaries")
          .select("*")
          .eq("company_id", company.id);

        if (error) throw error;

        setAvailableSubsidiaries(data || []);

        // Always set the first subsidiary when subsidiaries are loaded
        if (data && data.length > 0) {
          setSubsidiary(data[0]);
        }
      } catch (error) {
        console.error("Error fetching subsidiaries:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der Gesellschaften",
          className: "border-red-500",
        });
      }
    };

    fetchSubsidiaries();
  }, [company]);

  const setSelectedCompany = async (newCompany: Company | null) => {
    setCompany(newCompany);
    setSubsidiary(null); // Reset subsidiary when company changes
  };

  const setSelectedSubsidiary = (newSubsidiary: Subsidiary | null) => {
    setSubsidiary(newSubsidiary);
  };

  return (
    <CompanyContext.Provider
      value={{
        company,
        subsidiary,
        availableCompanies,
        availableSubsidiaries,
        setSelectedCompany,
        setSelectedSubsidiary,
        isLoading,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};
