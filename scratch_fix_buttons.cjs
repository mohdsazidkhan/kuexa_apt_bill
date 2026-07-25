const fs = require('fs');
let code = fs.readFileSync('src/components/NewBillModal.jsx', 'utf8');

// 1. Remove buttons from CheckoutPanel
const checkoutPanelButtonsStart = `          <div className="flex gap-3 pt-2">
            <button 
              onClick={onSaveDraft}`;
const checkoutPanelButtonsEnd = `✓ Print & Save
            </button>
          </div>`;

const startIndex = code.indexOf(checkoutPanelButtonsStart);
const endIndex = code.indexOf(checkoutPanelButtonsEnd) + checkoutPanelButtonsEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + code.substring(endIndex);
}

// 2. Change the Footer logic in main component
const footerTargetOld = `{/* Footer */}
        {!showAll && (
        <div className="border-t border-gray-200 bg-white px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="hidden text-sm text-gray-500 md:block">`;

const footerTargetNew = `{/* Footer */}
        <div className="border-t border-gray-200 bg-white px-6 py-3">
          {showAll ? (
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-[1] rounded-lg border border-indigo-600 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                Save Draft
              </button>
              <button 
                onClick={handleBook}
                disabled={totalItems === 0}
                className="flex-[3] rounded-lg bg-[#4a7196] py-3 text-sm font-bold text-white shadow hover:bg-[#3d6083] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ✓ Print & Save
              </button>
            </div>
          ) : (
          <div className="flex flex-wrap items-center gap-3">
            <span className="hidden text-sm text-gray-500 md:block">`;

code = code.replace(footerTargetOld, footerTargetNew);

const footerEndOld = `              </button>
            </div>
          </div>
        </div>
        )}

        {/* Browse`;

const footerEndNew = `              </button>
            </div>
          </div>
          )}
        </div>

        {/* Browse`;

code = code.replace(footerEndOld, footerEndNew);

fs.writeFileSync('src/components/NewBillModal.jsx', code);
console.log('Fixed buttons to bottom');
