"use client";

import { nextTrip, toNextTrip } from "@/lib/trips";
import { useApp } from "../AppState/AppState";
import NextTripCard from "../NextTripCard/NextTripCard";
import SearchForm from "../SearchForm/SearchForm";

export default function TripPlanner() {
    const { state } = useApp();
    const role = state.profile.role;
    const next = nextTrip(state.trips, role);

    return (
        <>
            <SearchForm />
            <NextTripCard role={role} trip={next ? toNextTrip(next) : null} />
        </>
    )
}
