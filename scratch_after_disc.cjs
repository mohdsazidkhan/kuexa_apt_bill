const fs = require('fs');
let code = fs.readFileSync('src/components/NewBillModal.jsx', 'utf8');

const replacement = `          )}
        </div>

        {totalSaved > 0 && (
          <div className="flex justify-between items-center text-gray-800 font-medium pt-1 pb-1">
            <span>After Disc.</span>
            <span>{currency(afterDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between items-center text-gray-600">`;

code = code.replace(
  `          )}
        </div>

        <div className="flex justify-between items-center text-gray-600">`,
  replacement
);

fs.writeFileSync('src/components/NewBillModal.jsx', code);
console.log("Updated NewBillModal.jsx for After Disc");
