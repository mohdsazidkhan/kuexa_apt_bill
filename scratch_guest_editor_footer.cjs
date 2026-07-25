const fs = require('fs');
let code = fs.readFileSync('src/components/NewBillModal.jsx', 'utf8');

// 1. Pass rowDiscountAmount to GuestEditor (around line 285)
code = code.replace(
  "onClientDetails={() => setClientView(activeGuest.customer)}\n              total={guestTotal(activeGuest)}\n            />",
  "onClientDetails={() => setClientView(activeGuest.customer)}\n              total={guestTotal(activeGuest)}\n              rowDiscountAmount={rowDiscountAmount}\n            />"
);

// 2. Update GuestEditor signature (around line 576)
code = code.replace(
  "function GuestEditor({ guest, guestName, onCustomer, onPatch, onRecent, onRow, onRemoveRow, onBrowse, onClientDetails, total }) {",
  "function GuestEditor({ guest, guestName, onCustomer, onPatch, onRecent, onRow, onRemoveRow, onBrowse, onClientDetails, total, rowDiscountAmount }) {"
);

// 3. Update the footer in GuestEditor (around line 728)
const oldFooter = `<div className="mt-2 flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-x-2 truncate whitespace-nowrap">
                <span>Total {totalItems}</span>
                {typeBreakdown.length > 0 && (
                  <span className="font-normal text-gray-500">({typeBreakdown.join(', ')})</span>
                )}
              </span>
              <span className="text-indigo-600 mr-2">{currency(total)}</span>
            </div>`;

const newFooter = `
            <div className="mt-2 flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">
              <span className="flex items-center gap-x-2 truncate whitespace-nowrap">
                <span>Total {totalItems}</span>
                {typeBreakdown.length > 0 && (
                  <span className="font-normal text-gray-500">({typeBreakdown.join(', ')})</span>
                )}
              </span>
              <div className="flex items-center gap-6 mr-2">
                {(() => {
                  const guestGrossTotal = guest.rows.reduce((s, r) => s + ((Number(r.price) || 0) * (r.qty || 1)), 0);
                  const guestDiscountTotal = guest.rows.reduce((s, r) => s + (rowDiscountAmount ? rowDiscountAmount(r) : 0), 0);
                  if (guestDiscountTotal > 0) {
                    return (
                      <>
                        <span className="text-gray-500 font-medium">Price: {currency(guestGrossTotal)}</span>
                        <span className="text-emerald-600 font-medium">Disc: -{currency(guestDiscountTotal)}</span>
                      </>
                    );
                  }
                  return null;
                })()}
                <span className="text-indigo-600 font-bold">Net: {currency(total)}</span>
              </div>
            </div>`;

code = code.replace(oldFooter, newFooter);

fs.writeFileSync('src/components/NewBillModal.jsx', code);
console.log("Updated NewBillModal.jsx for GuestEditor footer totals");
