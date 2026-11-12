import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";

// Écrans de connexion : un compte déjà connecté repart directement sur l'accueil
export default function ConnexionLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <Guest>{children}</Guest>
    </Suspense>
  );
}

async function Guest({ children }: { children: ReactNode }) {
  if (await getCurrentUser()) redirect("/");
  return children;
}
