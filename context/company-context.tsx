"use client";

// TODO: Create a Context to store the company id and subsidiary and the subsidary can be changed in the sidebar we can store that in the cookies

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { Company, Subsidiary, CompanyUser, UserProfile } from "@/shared/model";
import { useUser } from "./user-context";
import { supabase } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Roles } from "@/shared/model";

// Storage keys
const COMPANY_STORAGE_KEY = "selected_company_id";
const SUBSIDIARY_STORAGE_KEY = "selected_subsidiary_id";

interface CompanyContextType {
  company: Company | null;
  subsidiary: Subsidiary | null;
  availableCompanies: Company[];
  availableSubsidiaries: Subsidiary[];
  setSelectedCompany: (company: Company | null) => Promise<void>;
  setSelectedSubsidiary: (subsidiary: Subsidiary | null) => void;
  refreshSubsidiary: () => Promise<void>;
  isLoading: boolean;
}

export const CompanyContext = createContext<CompanyContextType>({
  company: null,
  subsidiary: null,
  availableCompanies: [],
  availableSubsidiaries: [],
  setSelectedCompany: async () => {},
  setSelectedSubsidiary: () => {},
  refreshSubsidiary: async () => {},
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

  // Track if we've already loaded from localStorage
  const hasLoadedFromStorage = useRef(false);

  // Load saved selections from localStorage
  const loadSavedSelections = async () => {
    if (!user || hasLoadedFromStorage.current) return;

    try {
      // Check if we're in a browser environment
      if (typeof window !== "undefined") {
        const savedCompanyId = localStorage.getItem(COMPANY_STORAGE_KEY);

        if (savedCompanyId) {
          const { data: savedCompany } = await supabase
            .from("companies")
            .select("*")
            .eq("id", savedCompanyId)
            .single();

          if (savedCompany) {
            setCompany(savedCompany);

            const savedSubsidiaryId = localStorage.getItem(
              SUBSIDIARY_STORAGE_KEY,
            );
            if (savedSubsidiaryId) {
              const { data: savedSubsidiary } = await supabase
                .from("subsidiaries")
                .select("*")
                .eq("id", savedSubsidiaryId)
                .eq("company_id", savedCompany.id)
                .single();

              if (savedSubsidiary) {
                setSubsidiary(savedSubsidiary);
              }
            }
          }
        }

        hasLoadedFromStorage.current = true;
      }
    } catch (error) {
      console.error("Error loading saved selections:", error);
    }
  };

  // Save selections to localStorage
  const saveSelectionsToStorage = () => {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      if (company) {
        localStorage.setItem(COMPANY_STORAGE_KEY, company.id);
      } else {
        localStorage.removeItem(COMPANY_STORAGE_KEY);
      }

      if (subsidiary) {
        localStorage.setItem(SUBSIDIARY_STORAGE_KEY, subsidiary.id);
      } else {
        localStorage.removeItem(SUBSIDIARY_STORAGE_KEY);
      }
    }
  };

  // Load saved selections when user is available
  useEffect(() => {
    if (user) {
      loadSavedSelections();
    } else {
      // Reset state when user is not available
      setCompany(null);
      setSubsidiary(null);
      setAvailableCompanies([]);
      setAvailableSubsidiaries([]);
      hasLoadedFromStorage.current = false;
    }
  }, [user]);

  // Save selections when they change
  useEffect(() => {
    if (company !== null || subsidiary !== null) {
      saveSelectionsToStorage();
    }
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

          // Only set first company if no company is selected and we've already checked localStorage
          if (
            data &&
            data.length > 0 &&
            !company &&
            hasLoadedFromStorage.current
          ) {
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

            // Only set first company if no company is selected and we've already checked localStorage
            if (
              companies &&
              companies.length > 0 &&
              !company &&
              hasLoadedFromStorage.current
            ) {
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
            const { data: companyData, error: companyError } = await supabase
              .from("companies")
              .select("*")
              .eq("id", companyUser.company_id)
              .single();

            if (companyError) throw companyError;

            if (companyData) {
              setAvailableCompanies([companyData]);

              // Only set company if no company is selected and we've already checked localStorage
              if (!company && hasLoadedFromStorage.current) {
                await setSelectedCompany(companyData);
              }
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
  }, [user, hasLoadedFromStorage.current]);

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

        // Set first subsidiary if available and none selected
        if (data && data.length > 0 && !subsidiary) {
          // Check if there's a saved subsidiary in localStorage first
          const savedSubsidiaryId = localStorage.getItem(
            SUBSIDIARY_STORAGE_KEY,
          );
          const matchingSubsidiary = data.find(
            (sub) => sub.id === savedSubsidiaryId,
          );

          if (matchingSubsidiary) {
            setSelectedSubsidiary(matchingSubsidiary);
          } else if (hasLoadedFromStorage.current) {
            // Only set default if we've already checked localStorage
            setSelectedSubsidiary(data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching subsidiaries:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Laden der Niederlassungen",
          className: "border-red-500",
        });
      }
    };

    fetchSubsidiaries();
  }, [company]);

  const setSelectedCompany = async (newCompany: Company | null) => {
    setCompany(newCompany);
    // Reset subsidiary when company changes
    setSubsidiary(null);
  };

  const setSelectedSubsidiary = (newSubsidiary: Subsidiary | null) => {
    setSubsidiary(newSubsidiary);
  };

  const refreshSubsidiary = async () => {
    if (!company || !subsidiary) return;

    try {
      const { data, error } = await supabase
        .from("subsidiaries")
        .select("*")
        .eq("id", subsidiary.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setSubsidiary(data as Subsidiary);
      }
    } catch (error) {
      console.error("Error refreshing subsidiary:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Aktualisieren der Tochtergesellschaft.",
        variant: "destructive",
      });
    }
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
        refreshSubsidiary,
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

export const useSubsidiaries = async () => {
  const { company } = useCompany();
  const { data: subsidiaries, error } = await supabase
    .from("subsidiaries")
    .select("*")
    .eq("company_id", company?.id);

  return { subsidiaries, error };
};
