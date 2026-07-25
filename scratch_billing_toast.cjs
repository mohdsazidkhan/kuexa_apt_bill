const fs = require('fs');

// 1. Update NewBillModal.jsx
let newBillCode = fs.readFileSync('src/components/NewBillModal.jsx', 'utf8');

newBillCode = newBillCode.replace(
  "export default function NewBillModal({ open, onClose, onBooked }) {",
  "export default function NewBillModal({ open, onClose, onBooked, onSaveDraft }) {"
);

// We need to replace the onClose for the "Save Draft" button
// Search for onClick={onClose} just before className="flex-[1] rounded-lg border-2 border-indigo-400...
newBillCode = newBillCode.replace(
  /onClick=\{onClose\}\s+className="flex-\[1\] rounded-lg border-2 border-indigo-400/g,
  `onClick={onSaveDraft || onClose}\n                  className="flex-[1] rounded-lg border-2 border-indigo-400`
);

fs.writeFileSync('src/components/NewBillModal.jsx', newBillCode);


// 2. Update Billing.jsx
let billingCode = fs.readFileSync('src/pages/Billing.jsx', 'utf8');

// Import useEffect if not already imported
if (!billingCode.includes("import { useState, useEffect } from 'react'")) {
  billingCode = billingCode.replace(
    "import { useState } from 'react'",
    "import { useState, useEffect } from 'react'"
  );
}

// Add state and effect
billingCode = billingCode.replace(
  "const [newBillOpen, setNewBillOpen] = useState(false)",
  "const [newBillOpen, setNewBillOpen] = useState(false)\n  const [toast, setToast] = useState('')\n\n  useEffect(() => {\n    if (!toast) return\n    const t = setTimeout(() => setToast(''), 3500)\n    return () => clearTimeout(t)\n  }, [toast])"
);

// Update NewBillModal usage
billingCode = billingCode.replace(
  "<NewBillModal open={newBillOpen} onClose={() => setNewBillOpen(false)} />",
  `<NewBillModal 
        open={newBillOpen} 
        onClose={() => setNewBillOpen(false)}
        onBooked={() => {
          setNewBillOpen(false);
          setToast('Bill Created Successfully');
        }}
        onSaveDraft={() => {
          setNewBillOpen(false);
          setToast('Bill Saved as Draft');
        }}
      />`
);

// Add toast UI at the end
billingCode = billingCode.replace(
  "    </div>\n  )\n}",
  `      {/* Success toast */}\n      {toast && (\n        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">\n          <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">\n            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>\n          </div>\n          <span className="font-medium text-sm">{toast}</span>\n        </div>\n      )}\n    </div>\n  )\n}`
);

fs.writeFileSync('src/pages/Billing.jsx', billingCode);
console.log("Updated Billing.jsx and NewBillModal.jsx for toast notifications");
