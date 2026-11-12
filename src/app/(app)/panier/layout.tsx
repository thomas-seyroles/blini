import type { ReactNode } from "react";
import { CartFlowProvider } from "@/components/CartFlow/CartFlow";

export default function PanierLayout({ children }: { children: ReactNode }) {
    return <CartFlowProvider>{children}</CartFlowProvider>;
}
