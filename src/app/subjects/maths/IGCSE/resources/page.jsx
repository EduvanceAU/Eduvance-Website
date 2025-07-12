import { useSupabaseAuth } from "@/components/client/SupabaseAuthContext";

export default function IGCSEResources() {
  const { session, user, loading: authLoading } = useSupabaseAuth();
} 