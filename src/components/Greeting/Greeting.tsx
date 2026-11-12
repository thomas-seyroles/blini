"use client";

import { useApp } from "../AppState/AppState";

export default function Greeting({ className }: { className?: string }) {
    const { state } = useApp();
    return <p className={className}>Bonjour {state.profile.firstName} !</p>;
}
