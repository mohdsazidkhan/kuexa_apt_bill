const fs = require('fs');
let code = fs.readFileSync('src/components/NewBillModal.jsx', 'utf8');

// 1. Add Icons if needed
if (!code.includes('IconCreditCard')) {
  // Let's just use placeholder text/emoji for icons if not available, or standard ones.
  // We have IconUsers, IconMenu, IconClose, IconPlus, IconHome, IconGrid
}

// 2. Add State variables
const stateTarget = `  const [pendingSplit, setPendingSplit] = useState(null) // Rule 3 confirm: { gender, items, existingId, existingName }`;
const stateAdd = `  const [manualDiscount, setManualDiscount] = useState('')
  const [tip, setTip] = useState('')
  const [paymentMode, setPaymentMode] = useState('Cash')
  const [splitPayment, setSplitPayment] = useState(false)
  const [saleBy, setSaleBy] = useState('')
  const [remarks, setRemarks] = useState('')`;

if (!code.includes('manualDiscount')) {
  code = code.replace(stateTarget, stateTarget + '\n' + stateAdd);
}

// 3. Replace body and footer
const bodyTarget = `{/* Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50/40 p-4">
          {showAll ? (
            <AllSummary guests={guests} guestName={guestName} guestTotal={guestTotal} onOpen={setActive} onClient={setClientView} />
          ) : (
            <GuestEditor`;

const newBody = `{/* Body */}
        <div className="flex-1 overflow-y-auto bg-gray-50/40 p-4">
          {showAll ? (
            <div className="space-y-4">
              <AllSummary guests={guests} guestName={guestName} guestTotal={guestTotal} onOpen={setActive} onClient={setClientView} />
              
              <CheckoutPanel 
                subtotal={grandTotal}
                manualDiscount={manualDiscount} setManualDiscount={setManualDiscount}
                tip={tip} setTip={setTip}
                paymentMode={paymentMode} setPaymentMode={setPaymentMode}
                splitPayment={splitPayment} setSplitPayment={setSplitPayment}
                saleBy={saleBy} setSaleBy={setSaleBy}
                remarks={remarks} setRemarks={setRemarks}
                onSaveDraft={onClose}
                onPrintAndSave={handleBook}
                disabled={totalItems === 0}
              />
            </div>
          ) : (
            <GuestEditor`;

code = code.replace(bodyTarget, newBody);

const footerTarget = `{/* Footer */}
        <div className="border-t border-gray-200 bg-white px-6 py-3">`;
const newFooter = `{/* Footer */}
        {!showAll && (
        <div className="border-t border-gray-200 bg-white px-6 py-3">`;

code = code.replace(footerTarget, newFooter);

const endFooterTarget = `</div>
          </div>
        </div>

        {/* Browse`;
const newEndFooter = `</div>
          </div>
        </div>
        )}

        {/* Browse`;
code = code.replace(endFooterTarget, newEndFooter);

// 4. Append CheckoutPanel component
const checkoutPanelCode = `
function CheckoutPanel({ 
  subtotal, 
  manualDiscount, setManualDiscount, 
  tip, setTip, 
  paymentMode, setPaymentMode, 
  splitPayment, setSplitPayment,
  saleBy, setSaleBy,
  remarks, setRemarks,
  onSaveDraft, onPrintAndSave,
  disabled
}) {
  const packageDiscount = 0; // Placeholder for now
  const md = Number(manualDiscount) || 0;
  const t = Number(tip) || 0;
  
  const totalSaved = packageDiscount + md;
  const afterDiscount = Math.max(0, subtotal - totalSaved);
  const tax = afterDiscount * 0.18; // 18% tax
  const roundOff = Math.round(afterDiscount + tax + t) - (afterDiscount + tax + t);
  const netTotal = Math.round(afterDiscount + tax + t);

  const modes = [
    { id: 'Cash', label: 'Cash', icon: '💵' },
    { id: 'Card', label: 'Card', icon: '💳' },
    { id: 'UPI', label: 'UPI', icon: '📱' },
    { id: 'Gift Card', label: 'Gift Card', icon: '🎁' },
    { id: 'Net Banking', label: 'Net Banking', icon: '🏦' }
  ];

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center text-gray-600">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-800">{currency(subtotal)}</span>
        </div>
        
        {packageDiscount > 0 && (
          <div className="flex justify-between items-center text-emerald-600">
            <span className="flex items-center gap-1">📦 Package Discount</span>
            <span className="font-medium">- {currency(packageDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-gray-600">
          <span className="flex items-center gap-2">
            Manual Discount
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input 
                type="number" 
                value={manualDiscount}
                onChange={(e) => setManualDiscount(e.target.value)}
                className="w-20 rounded border border-gray-200 py-1 pl-6 pr-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </span>
        </div>

        {totalSaved > 0 && (
          <div className="flex justify-between items-center bg-emerald-50/50 px-2 py-1 rounded text-emerald-600 text-xs italic">
            <span>Total Saved</span>
            <span className="font-bold">- {currency(totalSaved)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-gray-600">
          <span className="flex items-center gap-1">
            Tax (18%) <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">CGST+SGST</span>
          </span>
          <span className="font-semibold text-gray-800">{currency(tax)}</span>
        </div>

        <div className="flex justify-between items-center text-gray-600">
          <span>Round Off</span>
          <span className="font-semibold text-gray-800">{currency(roundOff)}</span>
        </div>

        <div className="flex justify-between items-center text-gray-600">
          <span className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-600">💵 Tip</span>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
              <input 
                type="number" 
                value={tip}
                onChange={(e) => setTip(e.target.value)}
                className="w-20 rounded border border-gray-200 py-1 pl-6 pr-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </span>
        </div>

        <div className="my-4 border-t border-gray-100"></div>

        <div className="flex justify-between items-end">
          <div className="text-sm font-bold text-gray-800 uppercase tracking-wider">Net Total</div>
          <div className="text-3xl font-bold text-indigo-500">{currency(netTotal)}</div>
        </div>

        <div className="mt-6 space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={splitPayment}
              onChange={(e) => setSplitPayment(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Split Payment</span>
          </label>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {modes.map(m => (
              <button
                key={m.id}
                onClick={() => setPaymentMode(m.id)}
                className={\`flex-1 min-w-[90px] flex flex-col items-center justify-center gap-1 rounded-xl border p-2 text-xs transition-colors \${
                  paymentMode === m.id 
                    ? 'border-emerald-500 bg-emerald-50/20 text-emerald-600 font-bold' 
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 font-medium'
                }\`}
              >
                <span className="text-xl">{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>

          <select 
            value={saleBy} 
            onChange={(e) => setSaleBy(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm text-gray-500 outline-none focus:border-indigo-400"
          >
            <option value="">Sale By (optional)</option>
            {stylists.map(s => <option key={s.id}>{s.name}</option>)}
          </select>

          <input 
            type="text" 
            placeholder="Remarks (optional)" 
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm outline-none focus:border-indigo-400"
          />

          <div className="flex gap-3 pt-2">
            <button 
              onClick={onSaveDraft}
              className="flex-1 rounded-lg border-2 border-indigo-400 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Save Draft
            </button>
            <button 
              onClick={onPrintAndSave}
              disabled={disabled}
              className="flex-[2] rounded-lg bg-[#4a7196] py-3 text-sm font-bold text-white shadow hover:bg-[#3d6083] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ✓ Print & Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
`;

if (!code.includes('function CheckoutPanel')) {
  code += '\n' + checkoutPanelCode;
}

fs.writeFileSync('src/components/NewBillModal.jsx', code);
console.log('Successfully updated NewBillModal.jsx');
