'use client'

import { Button } from "@/components/ui/button";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const DashboardPage = () => {
    const router = useRouter();
    return ( 
        <div>
            <h1>Dashboard</h1>

        </div>
     );
}
 
export default DashboardPage;