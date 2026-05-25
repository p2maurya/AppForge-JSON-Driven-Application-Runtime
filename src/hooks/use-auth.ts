"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string | null;
}

export function useAuth(redirectIfUnauth = false) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.data?.user) {
          setUser(json.data.user);
        } else if (redirectIfUnauth) {
          router.push("/login");
        }
      })
      .catch(() => {
        if (redirectIfUnauth) router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [redirectIfUnauth, router]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return { user, loading, logout };
}
