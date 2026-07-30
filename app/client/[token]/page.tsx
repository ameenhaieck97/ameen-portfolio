import type { Metadata } from "next";
import { getServerReadClient } from "@/lib/supabase/server-read";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ClientStatementView } from "@/components/finance/ClientStatementView";
import type { PublicClientStatement } from "@/types/finance";

// Token-secured, per-client financial statement — never indexable, even
// though the route itself stays reachable to anyone holding the link.
export const metadata: Metadata = {
  title: "Client Statement — Ameen Haieck",
  robots: { index: false, follow: false },
};

async function getPublicClientStatement(token: string): Promise<PublicClientStatement | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = getServerReadClient();
    const { data, error } = await supabase.rpc("get_public_client_statement", { p_token: token });
    if (error || !data) return null;
    return data as PublicClientStatement;
  } catch {
    return null;
  }
}

export default async function PublicClientStatementPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const statement = await getPublicClientStatement(token);

  if (!statement) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6">
        <div className="glass rounded-3xl p-10 text-center">
          <p className="font-display text-xl text-ivory" dir="rtl">
            كشف الحساب غير موجود
          </p>
          <p className="mt-1 text-sm text-ivory/55" dir="rtl">
            قد يكون هذا الرابط غير صحيح أو تم حذف الحساب.
          </p>
          <p className="mt-4 font-display text-xl text-ivory">Statement not found</p>
          <p className="mt-1 text-sm text-ivory/55">
            This link may be incorrect or the account may have been removed.
          </p>
        </div>
      </main>
    );
  }

  return <ClientStatementView statement={statement} />;
}
