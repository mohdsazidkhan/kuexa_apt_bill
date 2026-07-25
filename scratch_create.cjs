const fs = require('fs');
let code = fs.readFileSync('src/components/GroupBookingModal.jsx', 'utf8');

// 1. Rename component
code = code.replace(/GroupBookingModal/g, 'NewBillModal');

// 2. Change 'New Appointment' text to 'New Bill'
code = code.replace(/>New Appointment<\/h2>/g, '>New Bill</h2>');
code = code.replace(/'Book Appointment'/g, '\'Generate Bill\'');

// 3. Update the GuestEditor row rendering
const rowStart = code.indexOf('<div className="space-y-2">');
const rowEnd = code.indexOf('<div className="mt-2 flex items-center gap-2.5');
if (rowStart === -1 || rowEnd === -1) {
    console.error('Could not find row rendering block');
    process.exit(1);
}

const newRowRender = `            <div className="space-y-2">
              {guest.rows.map((row, idx) => {
                const tag = row.typeLabel || 'Service'
                const m = tagStyle(tag)
                const isServiceOrProduct = row.kind === 'service' || row.kind === 'product'

                return (
                  <div key={row.uid} className="flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white p-2 shadow-sm">
                    <span className={\`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white \${m.dot}\`}>{nums[idx]}</span>
                    
                    <div className="w-40 shrink-0 truncate text-sm font-semibold text-gray-800" title={row.name}>
                      {row.name}
                    </div>

                    <div className="w-72 shrink-0 flex items-center">
                      {isServiceOrProduct && (
                        <div className="flex items-center gap-1.5 rounded bg-[#ebf8f2] px-2 py-1 text-[11px]">
                          <span className="font-bold text-[#20925e]">📦 Package</span>
                          <span className="font-semibold text-[#188050]">-₹440.00</span>
                          <select className="w-28 rounded border border-gray-200 bg-white px-1 py-0.5 text-[10px] text-gray-700 outline-none">
                            <option>Service Package for Bi (8...</option>
                          </select>
                          <button className="text-gray-400 hover:text-gray-600"><IconClose width={10} height={10} /></button>
                        </div>
                      )}
                    </div>

                    <div className="flex-1" />

                    <div className="w-32 shrink-0">
                      <select className="w-full rounded border border-gray-200 px-2 py-1.5 text-xs text-gray-500 outline-none focus:border-indigo-400">
                        <option value="">Sale By (optional)...</option>
                        {stylists.map(s => <option key={s.id}>{s.name}</option>)}
                      </select>
                    </div>

                    <div className="w-32 shrink-0">
                      <StylistSelect value={row.stylist} onChange={(v) => onRow(row.uid, { stylist: v })} placeholder="Assign stylist..." />
                    </div>

                    <div className="w-14 shrink-0 text-right text-sm text-gray-500">
                      {currency(row.price)}
                    </div>

                    <div className="flex shrink-0 items-center rounded-lg border border-gray-200 overflow-hidden bg-white">
                      <button onClick={() => onRow(row.uid, { qty: Math.max(1, (row.qty || 1) - 1) })} className="px-2 py-0.5 text-gray-500 hover:bg-gray-50">−</button>
                      <span className="w-6 text-center text-sm font-semibold text-gray-800">{row.qty || 1}</span>
                      <button onClick={() => onRow(row.uid, { qty: (row.qty || 1) + 1 })} className="bg-indigo-500 px-2 py-0.5 text-white hover:bg-indigo-600">+</button>
                    </div>

                    <div className="w-16 shrink-0 text-right text-sm font-bold text-gray-800">
                      {currency((row.price || 0) * (row.qty || 1))}
                    </div>

                    <button onClick={() => onRemoveRow(row.uid)} className="flex shrink-0 items-center justify-center p-1 text-rose-400 hover:text-rose-600">
                      <IconClose width={14} height={14} />
                    </button>
                  </div>
                )
              })}
            </div>
`;

code = code.substring(0, rowStart) + newRowRender + code.substring(rowEnd);

// 4. Update total logic to include qty
code = code.replace(
  /const guestTotal = \(g\) => g\.rows\.reduce\(\(s, r\) => s \+ \(Number\(r\.price\) \|\| 0\), 0\)/g,
  'const guestTotal = (g) => g.rows.reduce((s, r) => s + ((Number(r.price) || 0) * (r.qty || 1)), 0)'
);

// 5. Remove the table header since we changed the row layout completely
const headerStart = code.indexOf('<div className="mb-1.5 flex items-center gap-2.5 px-3 text-[11px] font-semibold text-gray-900">');
const headerEnd = code.indexOf('<div className="space-y-2">');
if(headerStart !== -1 && headerEnd !== -1) {
   code = code.substring(0, headerStart) + code.substring(headerEnd);
}

fs.writeFileSync('src/components/NewBillModal.jsx', code);
console.log('NewBillModal.jsx created');
