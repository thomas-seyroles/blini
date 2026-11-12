import type { ReactNode } from "react";
import { RaconterProvider } from "@/components/RaconterProvider/RaconterProvider";

export default function RaconterLayout({ children }: { children: ReactNode }) {
  return <RaconterProvider>{children}</RaconterProvider>;
}
