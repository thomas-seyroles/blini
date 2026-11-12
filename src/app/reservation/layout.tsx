import { ReservationProvider } from "@/components/ReservationProvider/ReservationProvider";

export default function ReservationLayout({ children }: LayoutProps<"/reservation">) {
  return <ReservationProvider>{children}</ReservationProvider>;
}
