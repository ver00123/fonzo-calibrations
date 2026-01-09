import { useState, useEffect } from "react";
import supabase from "@/helper/supabaseClient";

export const useAuthChecker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Session error:", error.message);

      setIsAuthenticated(!!data.session);
      setIsLoading(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { isLoading, isAuthenticated };
};
