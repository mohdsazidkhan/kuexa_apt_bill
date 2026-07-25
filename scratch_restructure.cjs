const fs = require('fs');
let code = fs.readFileSync('src/pages/Billing.jsx', 'utf8');

const startTarget = '{/* Top Cards */}';
const endTarget = '{/* Filters */}';

const startIndex = code.indexOf(startTarget);
const endIndex = code.indexOf(endTarget);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find targets");
  process.exit(1);
}

const replacement = `
        {/* Billing Summary Collapsible */}
        <div className="mb-4 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <button 
            onClick={() => setSummaryOpen(!summaryOpen)} 
            className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {summaryOpen ? <IconArrowUp width={14} height={14} /> : <IconArrowDown width={14} height={14} />}
            Billing Summary
            <span className="ml-2 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">122 bills</span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">₹-8,88,11,98,567.80</span>
          </button>
          
          {summaryOpen && (
            <div className="border-t border-gray-100 bg-gray-50/30 p-4 space-y-4">
              
              {/* Top Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <IconReceipt width={20} height={20} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Bills</div>
                    <div className="text-xl font-bold text-indigo-600">122</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                    <span className="font-bold text-lg">₹</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</div>
                    <div className="text-xl font-bold text-sky-600">-8,88,11,98,567.80</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <span className="font-bold text-lg">✓</span>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Paid</div>
                    <div className="text-xl font-bold text-emerald-600">78</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <IconClock width={20} height={20} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pending / Partial</div>
                    <div className="text-xl font-bold text-amber-600">39</div>
                  </div>
                </div>
              </div>

              {/* Payment Mode Breakdown */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4 text-xs font-semibold text-gray-800 uppercase tracking-wider">Payment Mode Breakdown</div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-2 text-emerald-600"><span className="h-1 w-3 bg-emerald-500 inline-block rounded"></span> Cash</span>
                      <span className="text-gray-400">71 txn</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-emerald-600">
                      <span>₹16,49,147.75</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100"><div className="h-full w-[80%] rounded-full bg-emerald-500"></div></div>
                  </div>
                  
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-2 text-sky-600"><span className="h-1 w-3 bg-sky-500 inline-block rounded"></span> Adjustment</span>
                      <span className="text-gray-400">2 txn</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-sky-600">
                      <span>₹20,520.00</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100"><div className="h-full w-[5%] rounded-full bg-sky-500"></div></div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-2 text-indigo-600"><span className="h-1 w-3 bg-indigo-500 inline-block rounded"></span> Net Banking</span>
                      <span className="text-gray-400">1 txn</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-indigo-600">
                      <span>₹3,200.00</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100"><div className="h-full w-[2%] rounded-full bg-indigo-500"></div></div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-2 text-rose-500"><span className="h-1 w-3 bg-rose-500 inline-block rounded"></span> Refund</span>
                      <span className="text-gray-400">0 txn</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-rose-500">
                      <span>₹-9,505.20</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100"><div className="h-full w-[2%] rounded-full bg-rose-500"></div></div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-2 text-amber-500"><span className="h-1 w-3 bg-amber-500 inline-block rounded"></span> UPI</span>
                      <span className="text-gray-400">5 txn</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-amber-500">
                      <span>₹14,008.00</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100"><div className="h-full w-[5%] rounded-full bg-amber-500"></div></div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-2 text-slate-500"><span className="h-1 w-3 bg-slate-500 inline-block rounded"></span> Card</span>
                      <span className="text-gray-400">1 txn</span>
                    </div>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>₹2,705.00</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100"><div className="h-full w-[1%] rounded-full bg-slate-500"></div></div>
                  </div>
                </div>
              </div>

              {/* Today's Stats */}
              <div className="grid grid-cols-4 gap-4 border-t border-gray-100 pt-4 pb-2 text-center bg-transparent">
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Bills Today</div>
                  <div className="text-xl font-bold text-indigo-600">0</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Revenue</div>
                  <div className="text-xl font-bold text-emerald-500">₹0</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Outstanding</div>
                  <div className="text-xl font-bold text-amber-500">₹0</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Customers</div>
                  <div className="text-xl font-bold text-sky-500">0</div>
                </div>
              </div>

            </div>
          )}
        </div>

        `;

code = code.substring(0, startIndex) + replacement + code.substring(endIndex);
fs.writeFileSync('src/pages/Billing.jsx', code);
console.log("Billing.jsx updated successfully");
