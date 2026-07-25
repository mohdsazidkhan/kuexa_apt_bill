const fs = require('fs');
let code = fs.readFileSync('src/components/NewBillModal.jsx', 'utf8');

// 1. Update totals calculation (around line 183)
code = code.replace(
  "const rowTotal = (r) => Math.max(0, (Number(r.price) || 0) * (r.qty || 1) - ((r.kind === 'service' || r.kind === 'product') ? 440 : 0))",
  "const rowDiscountAmount = (r) => Math.min((Number(r.price) || 0) * (r.qty || 1), ((r.kind === 'service' || r.kind === 'product') ? 440 : 0))\n  const rowTotal = (r) => Math.max(0, (Number(r.price) || 0) * (r.qty || 1) - rowDiscountAmount(r))"
);

code = code.replace(
  "const grandTotal = guests.reduce((s, g) => s + guestTotal(g), 0)",
  "const grandTotal = guests.reduce((s, g) => s + guestTotal(g), 0)\n  const grossTotal = guests.reduce((s, g) => s + g.rows.reduce((ss, r) => ss + ((Number(r.price) || 0) * (r.qty || 1)), 0), 0)\n  const totalPackageDiscount = guests.reduce((s, g) => s + g.rows.reduce((ss, r) => ss + rowDiscountAmount(r), 0), 0)"
);

// 2. Update CheckoutPanel invocation (around line 269)
code = code.replace(
  "<AllSummary guests={guests} guestName={guestName} guestTotal={guestTotal} onOpen={setActive} onClient={setClientView} />",
  "<AllSummary guests={guests} guestName={guestName} guestTotal={guestTotal} onOpen={setActive} onClient={setClientView} rowDiscountAmount={rowDiscountAmount} />"
);

code = code.replace(
  "subtotal={grandTotal}",
  "subtotal={grossTotal}\n                packageDiscount={totalPackageDiscount}"
);

// 3. Update AllSummary function signature (around line 512)
code = code.replace(
  "function AllSummary({ guests, guestName, guestTotal, onOpen, onClient }) {",
  "function AllSummary({ guests, guestName, guestTotal, onOpen, onClient, rowDiscountAmount }) {"
);

// 4. Render discount in AllSummary items (around line 554)
code = code.replace(
  /<span className=\{`rounded px-1\.5 py-0\.5 text-\[10px\] font-semibold \$\{tagStyle\(r\.typeLabel\)\.pill\}`\}>\{r\.typeLabel\}<\/span>/,
  "<span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${tagStyle(r.typeLabel).pill}`}>{r.typeLabel}</span>\n                    {rowDiscountAmount && rowDiscountAmount(r) > 0 && (\n                      <span className=\"text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded\">\n                        Discount -{currency(rowDiscountAmount(r))}\n                      </span>\n                    )}"
);

// 5. Update CheckoutPanel signature to remove placeholder (around line 768)
code = code.replace(
  "function CheckoutPanel({\n  subtotal,",
  "function CheckoutPanel({\n  subtotal, packageDiscount,"
);
code = code.replace(
  "const packageDiscount = 0; // Placeholder for now\n",
  ""
);

fs.writeFileSync('src/components/NewBillModal.jsx', code);
console.log("Updated NewBillModal.jsx for AllSummary and CheckoutPanel discount");
