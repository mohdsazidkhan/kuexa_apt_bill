// Dummy salon data — derived from the KUEXA reference screens.

export const serviceCategories = [
  'All',
  'Colour & Highlights',
  'Hair Treatments',
  'Party Makeup',
  'De Tan',
  'Head Massage',
  'Haircut & Styling',
  'Hair Rituals',
  'Makeup Accessories',
  'Nail Extension',
  'Airbrush Makeup',
  'Bleach',
  'Body Spa',
  'Cleanup',
  'Hair Colour',
  'Nail Paint',
  'Hair Cut',
  'Waxing',
  'Makeup',
  'Beard Service',
  'Foot Massage',
]

// Simplified tabs used on the Billing POS screen.
export const billingTabs = ['All', 'Hair', 'Makeup', 'Mani Pedi', 'Nails', 'Skin']

export const services = [
  { id: 's1', name: 'Blow Dry & Styling', price: 440, duration: 45, category: 'Haircut & Styling', tab: 'Hair' },
  { id: 's2', name: 'Facial - Basic Clean-Up', price: 900, duration: 60, category: 'Cleanup', tab: 'Skin' },
  { id: 's3', name: 'Beard Grooming & Trim', price: 250, duration: 20, category: 'Beard Service', tab: 'Hair' },
  { id: 's4', name: 'Women Ombrè Highlights', price: 7000, duration: 120, category: 'Colour & Highlights', tab: 'Hair' },
  { id: 's5', name: 'MEN OMBRÈ HIGHLIGHTS', price: 5000, duration: 90, category: 'Colour & Highlights', tab: 'Hair' },
  { id: 's6', name: 'Men Express Color Treatment', price: 3000, duration: 30, category: 'Hair Colour', tab: 'Hair' },
  { id: 's7', name: 'Women Airbrush Make Up', price: 10000, duration: 180, category: 'Airbrush Makeup', tab: 'Makeup' },
  { id: 's8', name: 'Men Airbrush Make Up', price: 7000, duration: 160, category: 'Airbrush Makeup', tab: 'Makeup' },
  { id: 's9', name: 'Men Face De-tan', price: 500, duration: 30, category: 'De Tan', tab: 'Skin' },
  { id: 's10', name: 'Hair Massage', price: 500, duration: 30, category: 'Head Massage', tab: 'Hair' },
  { id: 's11', name: 'Women Fringe / Flicks', price: 700, duration: 25, category: 'Haircut & Styling', tab: 'Hair' },
  { id: 's12', name: 'Hair Spa', price: 1200, duration: 50, category: 'Hair Treatments', tab: 'Hair' },
  { id: 's13', name: 'Hair Spa Steam', price: 1200, duration: 50, category: 'Hair Treatments', tab: 'Hair' },
  { id: 's14', name: 'Women Hair Trimming', price: 600, duration: 60, category: 'Hair Cut', tab: 'Hair' },
  { id: 's15', name: 'Women Straight Hair Therapy', price: 8000, duration: 180, category: 'Hair Treatments', tab: 'Hair' },
  { id: 's16', name: 'Men Dry Hair Massage (Variant)', price: 600, duration: 30, category: 'Head Massage', tab: 'Hair' },
  { id: 's17', name: 'Female Accessories', price: 500, duration: 10, category: 'Makeup Accessories', tab: 'Makeup' },
  { id: 's18', name: 'Female Acrylic Cover Pink Extension', price: 2000, duration: 70, category: 'Nail Extension', tab: 'Nails' },
  { id: 's19', name: 'Female Acrylic Extension', price: 2000, duration: 120, category: 'Nail Extension', tab: 'Nails' },
  { id: 's20', name: 'Female Acrylic Nail Paint', price: 3000, duration: 30, category: 'Nail Paint', tab: 'Nails' },
  { id: 's21', name: 'Female Addon', price: 500, duration: 10, category: 'Makeup Accessories', tab: 'Makeup' },
  { id: 's22', name: 'Female Airbrush Bridal', price: 15000, duration: 120, category: 'Airbrush Makeup', tab: 'Makeup' },
  { id: 's23', name: 'Female Airbrush Ocassion', price: 11000, duration: 50, category: 'Airbrush Makeup', tab: 'Makeup' },
  { id: 's24', name: 'Female Airbrush Party', price: 6000, duration: 50, category: 'Party Makeup', tab: 'Makeup' },
  { id: 's25', name: 'Female Bleach', price: 1500, duration: 20, category: 'Bleach', tab: 'Skin' },
  { id: 's26', name: 'Female Blow Dry', price: 700, duration: 120, category: 'Haircut & Styling', tab: 'Hair' },
  { id: 's27', name: 'Female Blow Dry & Wash', price: 900, duration: 35, category: 'Haircut & Styling', tab: 'Hair' },
  { id: 's28', name: 'Female Body Massage', price: 4500, duration: 60, category: 'Body Spa', tab: 'Skin' },
  { id: 's29', name: 'Female Body Polishing', price: 5000, duration: 60, category: 'Body Spa', tab: 'Skin' },
  { id: 's30', name: 'Female Botox Treatment', price: 7500, duration: 90, category: 'Hair Treatments', tab: 'Hair' },
  { id: 's31', name: 'Crazy Color Hair Colour Canary', price: 453.81, duration: 45, category: 'Hair Colour', tab: 'Hair' },
  { id: 's32', name: 'Foot Reflexology Massage', price: 800, duration: 40, category: 'Foot Massage', tab: 'Skin' },
]

export const products = [
  { id: 'p1', name: 'Loreal Shampoo 300ml', price: 650, category: 'Hair Care', tab: 'Hair' },
  { id: 'p2', name: 'Keratin Conditioner', price: 850, category: 'Hair Care', tab: 'Hair' },
  { id: 'p3', name: 'Nail Polish Remover', price: 120, category: 'Nail Care', tab: 'Nails' },
  { id: 'p4', name: 'Face Serum Vitamin C', price: 1200, category: 'Skin Care', tab: 'Skin' },
  { id: 'p5', name: 'Matte Lipstick', price: 499, category: 'Makeup', tab: 'Makeup' },
  { id: 'p6', name: 'Hair Oil 200ml', price: 340, category: 'Hair Care', tab: 'Hair' },
]

export const plans = [
  { id: 'pl1', name: 'Gold Membership - 6 Months', price: 9999, type: 'Membership' },
  { id: 'pl2', name: 'Platinum Membership - 12 Months', price: 17999, type: 'Membership' },
  { id: 'pl3', name: 'Hair Care Package (10 sittings)', price: 8000, type: 'Package' },
  { id: 'pl4', name: 'Bridal Glow Package', price: 24999, type: 'Package' },
  { id: 'pl5', name: 'Gift Card - ₹2000', price: 2000, type: 'Gift Card' },
  { id: 'pl6', name: 'Gift Card - ₹5000', price: 5000, type: 'Gift Card' },
]

export const stylists = [
  { id: 'st1', name: 'Aarav Sharma' },
  { id: 'st2', name: 'Priya Verma' },
  { id: 'st3', name: 'Rahul Mehta' },
  { id: 'st4', name: 'Sneha Kapoor' },
  { id: 'st5', name: 'Imran Khan' },
]

export const customers = [
  { id: 'c1', name: 'Rajat Katiyar', phone: '7380785008', gender: 'Male' },
  { id: 'c2', name: 'Ananya Gupta', phone: '9876543210', gender: 'Female' },
  { id: 'c3', name: 'Vikram Singh', phone: '9812345678', gender: 'Male' },
  { id: 'c4', name: 'Meera Nair', phone: '9900112233', gender: 'Female' },
  { id: 'c5', name: 'Rohit Malhotra', phone: '9765432109', gender: 'Male' },
  { id: 'c6', name: 'Priya Sharma', phone: '9834567812', gender: 'Female' },
  { id: 'c7', name: 'Imran Ansari', phone: '9700456123', gender: 'Male' },
  { id: 'c8', name: 'Sneha Reddy', phone: '9812309876', gender: 'Female' },
  { id: 'c9', name: 'Karan Mehta', phone: '9654321870', gender: 'Male' },
  { id: 'c10', name: 'Divya Iyer', phone: '9900456781', gender: 'Female' },
]

// Past visits for a customer — shown in the "Recent Visits" modal.
export const recentVisits = [
  {
    id: 'v1',
    date: '02 Jul 2026',
    time: '4:45 PM',
    location: 'WorldMark sec 65',
    status: 'NoShow',
    items: [
      { name: 'Blow Dry & Styling', stylist: 'POONAM', price: 440 },
      { name: 'Facial - Basic Clean-Up', stylist: 'BRIJ MOHAN', price: 900 },
    ],
  },
  {
    id: 'v2',
    date: '18 Jun 2026',
    time: '1:15 PM',
    location: 'Khan Market',
    status: 'Completed',
    items: [
      { name: 'Women Ombrè Highlights', stylist: 'PRIYA', price: 7000 },
      { name: 'Hair Spa', stylist: 'AARAV', price: 1200 },
    ],
  },
  {
    id: 'v3',
    date: '30 May 2026',
    time: '11:00 AM',
    location: 'WorldMark sec 65',
    status: 'Completed',
    items: [
      { name: 'Female Body Polishing', stylist: 'SNEHA', price: 5000 },
    ],
  },
  {
    id: 'v4',
    date: '12 May 2026',
    time: '6:30 PM',
    location: 'Khan Market',
    status: 'Cancelled',
    items: [
      { name: 'Beard Grooming & Trim', stylist: 'IMRAN', price: 250 },
      { name: 'Men Face De-tan', stylist: 'IMRAN', price: 500 },
    ],
  },
  {
    id: 'v5',
    date: '28 Apr 2026',
    time: '3:00 PM',
    location: 'WorldMark sec 65',
    status: 'Completed',
    items: [
      { name: 'Women Straight Hair Therapy', stylist: 'POONAM', price: 8000 },
      { name: 'Female Blow Dry & Wash', stylist: 'POONAM', price: 900 },
      { name: 'Female Bleach', stylist: 'SNEHA', price: 1500 },
    ],
  },
]

export const membershipPlans = plans.filter((p) => p.type === 'Membership')
export const packagePlans = plans.filter((p) => p.type === 'Package')
export const giftCardPlans = plans.filter((p) => p.type === 'Gift Card')

export const currency = (n) =>
  '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
