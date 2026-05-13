import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";
import Providers from "@/components/layout/Providers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <Providers>
      <div className="min-h-dvh bg-background">
        <main className="pb-safe max-w-lg mx-auto">{children}</main>
        <BottomNav />
      </div>
    </Providers>
  );
}
