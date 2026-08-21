import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | WhereAmI",
  description: "Administrative console for inspecting check-in logs, real-time statistics, and user management.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
