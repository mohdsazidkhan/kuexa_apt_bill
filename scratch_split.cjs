const fs = require('fs');
let code = fs.readFileSync('src/components/NewBillModal.jsx', 'utf8');

// Add splitRows state
const stateTarget = `  const [splitPayment, setSplitPayment] = useState(false)`;
const stateAdd = `\n  const [splitRows, setSplitRows] = useState([{ id: Date.now(), mode: 'Cash', amount: '', ref: '' }])`;

if (!code.includes('splitRows')) {
  code = code.replace(stateTarget, stateTarget + stateAdd);
}

// Modify CheckoutPanel props
const propTarget = `                splitPayment={splitPayment} setSplitPayment={setSplitPayment}`;
const propAdd = `\n                splitRows={splitRows} setSplitRows={setSplitRows}\n                netTotal={Math.round(Math.max(0, grandTotal - (Number(manualDiscount) || 0)) * 1.18 + (Number(tip) || 0))}`;
if (!code.includes('splitRows={splitRows}')) {
  code = code.replace(propTarget, propTarget + propAdd);
}

// Update CheckoutPanel function signature
const fnTarget = `  splitPayment, setSplitPayment,`;
const fnAdd = `\n  splitRows, setSplitRows,\n  netTotal: passedNetTotal,`;
if (!code.includes('splitRows, setSplitRows')) {
  code = code.replace(fnTarget, fnTarget + fnAdd);
}

// Replace Split Payment rendering in CheckoutPanel
const uiTargetStart = `<div className="mt-6 space-y-4">`;
const uiTargetEnd = `<select \n            value={saleBy}`;

const uiNew = `<div className="mt-6 space-y-4">
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input 
              type="checkbox" 
              checked={splitPayment}
              onChange={(e) => setSplitPayment(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span className="text-sm text-gray-700 font-medium">Split Payment</span>
          </label>

          {splitPayment ? (
            <div className="space-y-2">
              {splitRows.map((row, idx) => (
                <div key={row.id} className="flex items-center gap-2">
                  <select
                    value={row.mode}
                    onChange={(e) => {
                      const newRows = [...splitRows];
                      newRows[idx].mode = e.target.value;
                      setSplitRows(newRows);
                    }}
                    className="w-32 rounded-lg border border-gray-200 py-1.5 px-2 text-sm text-gray-700 outline-none focus:border-indigo-400"
                  >
                    {modes.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                  
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                    <input 
                      type="number" 
                      value={row.amount}
                      onChange={(e) => {
                        const newRows = [...splitRows];
                        newRows[idx].amount = e.target.value;
                        setSplitRows(newRows);
                      }}
                      className="w-full rounded-lg border border-gray-200 py-1.5 pl-6 pr-2 text-sm outline-none focus:border-indigo-400"
                      placeholder="0.00"
                    />
                  </div>

                  {(row.mode === 'Card' || row.mode === 'UPI' || row.mode === 'Net Banking') && (
                    <input 
                      type="text" 
                      value={row.ref}
                      onChange={(e) => {
                        const newRows = [...splitRows];
                        newRows[idx].ref = e.target.value;
                        setSplitRows(newRows);
                      }}
                      className="w-24 rounded-lg border border-gray-200 py-1.5 px-2 text-sm outline-none focus:border-indigo-400"
                      placeholder="Ref"
                    />
                  )}

                  {row.mode === 'Gift Card' && (
                    <div className="flex gap-1">
                      <input 
                        type="text" 
                        value={row.ref}
                        onChange={(e) => {
                          const newRows = [...splitRows];
                          newRows[idx].ref = e.target.value;
                          setSplitRows(newRows);
                        }}
                        className="w-24 rounded-lg border border-gray-200 py-1.5 px-2 text-sm outline-none focus:border-indigo-400"
                        placeholder="Card no."
                      />
                      <button className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs font-medium text-gray-600">Check</button>
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      if (splitRows.length > 1) {
                        setSplitRows(splitRows.filter((_, i) => i !== idx));
                      }
                    }}
                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <div className="flex items-center justify-between pt-1">
                <button 
                  onClick={() => {
                    setSplitRows([...splitRows, { id: Date.now(), mode: 'Cash', amount: '', ref: '' }]);
                  }}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  + Add payment row
                </button>
                
                {(() => {
                  const totalSplit = splitRows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
                  const isBalanced = totalSplit === passedNetTotal;
                  return (
                    <span className={\`text-sm font-bold \${isBalanced ? 'text-emerald-500' : 'text-red-500'}\`}>
                      {isBalanced ? 'Balanced' : 'Unbalanced'}
                    </span>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {modes.map(m => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMode(m.id)}
                  className={\`flex-1 min-w-fit flex flex-row items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[10px] sm:text-[11px] whitespace-nowrap transition-colors \${
                    paymentMode === m.id 
                      ? 'border-emerald-500 bg-emerald-50/20 text-emerald-600 font-bold' 
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 font-medium'
                  }\`}
                >
                  <span className="text-sm">{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          )}

          <select 
            value={saleBy}`;

const oldCodeBlock = code.substring(code.indexOf(uiTargetStart), code.indexOf(uiTargetEnd) + uiTargetEnd.length);

if (oldCodeBlock.includes('modes.map')) {
  code = code.replace(oldCodeBlock, uiNew);
}

fs.writeFileSync('src/components/NewBillModal.jsx', code);
console.log('Successfully injected split payment UI');
