import { ViewTransition, type ReactElement } from "react";

// Avancer : la page arrive par la droite. Reculer : elle repart vers la droite.
export default function PageTransition({ children }: { children: ReactElement }) {
    return (
        <ViewTransition
            enter={{ "nav-forward": "slide-in-right", "nav-back": "reveal", default: "none" }}
            exit={{ "nav-forward": "hold", "nav-back": "slide-out-right", default: "none" }}
            default="none"
        >
            {children}
        </ViewTransition>
    );
}
