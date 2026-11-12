import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import AppChrome from "@/components/AppChrome/AppChrome";
import { AppStateProvider } from "@/components/AppState/AppState";
import { getCatalog } from "@/server/queries/catalog";
import { getAppData } from "@/server/queries/me";

// Toutes les pages de l'application lisent la session : elles sont rendues à la demande, derrière ce Suspense
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <Session>{children}</Session>
    </Suspense>
  );
}

async function Session({ children }: { children: ReactNode }) {
  const [data, catalog] = await Promise.all([getAppData(), getCatalog()]);
  if (!data) redirect("/connexion");
  return (
    <AppStateProvider data={data} catalog={catalog}>
      {children}
      <AppChrome />
    </AppStateProvider>
  );
}
