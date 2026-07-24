import { formatDate, formatIQD, formatUSD } from "@/lib/format";

export type ReceiptViewItem = {
  id: string;
  service: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

/**
 * Pure presentation of a receipt's contents — shared by the Studio's
 * ReceiptDrawer and the public read-only /receipt/{token} page, so the two
 * never drift apart, and so PDF/PNG export (which screenshots this exact
 * markup) always matches what's shown on screen.
 */
export function ReceiptView({
  receiptNumber,
  receiptDate,
  clientName,
  projectName,
  items,
  subtotal,
  discount,
  previousBalance,
  amountPaid,
  remainingBalance,
  exchangeRate,
  finalTotalIqd,
  notes,
  qrDataUrl,
}: {
  receiptNumber: number;
  receiptDate: string;
  clientName: string;
  projectName?: string | null;
  items: ReceiptViewItem[];
  subtotal: number;
  discount: number;
  previousBalance: number;
  amountPaid: number;
  remainingBalance: number;
  exchangeRate: number;
  finalTotalIqd: number;
  notes: string;
  /** Data URL of a QR code pointing at this receipt's public share link. */
  qrDataUrl?: string | null;
}) {
  return (
    <div className="space-y-6 rounded-2xl bg-canvas p-6">
      <div className="flex items-start justify-between gap-4 border-b border-white/8 pb-5">
        <div>
          <p className="font-display text-2xl text-ivory">
            Receipt #{String(receiptNumber).padStart(4, "0")}
          </p>
          <p className="mt-1 text-sm text-ivory/55">{formatDate(receiptDate, "en")}</p>
        </div>
        <div className="flex items-start gap-4">
          <div className="text-end">
            <p className="text-xs uppercase tracking-[0.1em] text-ivory/40">Client</p>
            <p className="mt-0.5 text-sm font-medium text-ivory">{clientName}</p>
            {projectName ? <p className="text-xs text-ivory/45">{projectName}</p> : null}
          </div>
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- data: URL, next/image can't optimize it and doesn't need to
            <img src={qrDataUrl} alt="Scan to view this receipt online" className="h-16 w-16 flex-none rounded-md bg-white p-1" />
          ) : null}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.12em] text-ivory/50">Items</p>
        {items.length === 0 ? (
          <p className="rounded-xl border border-white/8 px-4 py-3 text-sm text-ivory/45">
            No line items — this receipt only records a payment.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 text-start text-xs uppercase tracking-[0.08em] text-ivory/45">
                  <th className="px-4 py-2.5 text-start font-medium">Service</th>
                  <th className="px-4 py-2.5 text-end font-medium">Unit price</th>
                  <th className="px-4 py-2.5 text-end font-medium">Qty</th>
                  <th className="px-4 py-2.5 text-end font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-2.5 text-ivory">{item.service || "—"}</td>
                    <td className="px-4 py-2.5 text-end text-ivory/70">{formatUSD(item.unit_price)}</td>
                    <td className="px-4 py-2.5 text-end text-ivory/70">{item.quantity}</td>
                    <td className="px-4 py-2.5 text-end font-medium text-ivory">
                      {formatUSD(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-white/8 p-4 text-sm">
        <span className="text-ivory/50">Subtotal</span>
        <span className="text-end text-ivory">{formatUSD(subtotal)}</span>
        <span className="text-ivory/50">Discount</span>
        <span className="text-end text-ivory">{formatUSD(discount)}</span>
        <span className="text-ivory/50">Previous balance</span>
        <span className="text-end text-ivory">{formatUSD(previousBalance)}</span>
        <span className="border-t border-white/8 pt-3 text-ivory/50">Amount paid</span>
        <span className="border-t border-white/8 pt-3 text-end font-medium text-gold">
          {formatUSD(amountPaid)}
        </span>
        <span className="text-ivory/50">Remaining balance</span>
        <span className="text-end font-medium text-ivory">{formatUSD(remainingBalance)}</span>
        <span className="border-t border-white/8 pt-3 text-ivory/50">Exchange rate</span>
        <span className="border-t border-white/8 pt-3 text-end text-ivory">
          {Number(exchangeRate).toLocaleString("en-US")}
        </span>
        <span className="text-ivory/50">IQD total</span>
        <span className="text-end text-ivory">{formatIQD(finalTotalIqd)}</span>
      </div>

      {notes ? (
        <div>
          <p className="mb-1.5 text-xs uppercase tracking-[0.12em] text-ivory/50">Notes</p>
          <p className="text-sm leading-relaxed text-ivory/70">{notes}</p>
        </div>
      ) : null}
    </div>
  );
}
