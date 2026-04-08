export const PIPELINE_STAGES = [
  { id: "new", label: "New Lead", order: 0 },
  { id: "contacted", label: "Contacted", order: 1 },
  { id: "tour", label: "Tour Scheduled", order: 2 },
  { id: "offer", label: "Offer Made", order: 3 },
  { id: "contract", label: "Under Contract", order: 4 },
  { id: "closed", label: "Closed", order: 5 },
  { id: "dead", label: "Dead", order: 6 },
] as const;

export type StageId = (typeof PIPELINE_STAGES)[number]["id"];

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: "Seller" | "Buyer" | "Agent" | "Other";
  tags: string[];
  created_at: string;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  type: "Single Family" | "Multi Family" | "Condo" | "Townhouse" | "Land" | "Commercial";
  beds: number;
  baths: number;
  sqft: number;
  arv: number;
  asking_price: number;
  offer_price: number | null;
  status: "Available" | "Under Contract" | "Sold" | "Off Market";
  thumbnail: string;
  created_at: string;
}

export interface Lead {
  id: string;
  title: string;
  stage: StageId;
  priority: "Low" | "Medium" | "High" | "Urgent";
  source: string;
  estimated_value: number;
  next_follow_up: string | null;
  tags: string[];
  contact_id: string;
  property_id: string | null;
  assigned_user: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  due_date: string;
  priority: "Low" | "Medium" | "High";
  assigned_user: string;
  linked_entity: { type: "lead" | "contact" | "property"; id: string; name: string } | null;
  created_at: string;
}

export interface Note {
  id: string;
  content: string;
  author: string;
  entity_type: "lead" | "contact" | "property";
  entity_id: string;
  created_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  attendees: string[];
  entity_type: "lead" | "contact" | "property";
  entity_id: string;
  notes: string;
  created_at: string;
}

export interface DocFile {
  id: string;
  filename: string;
  type: "PDF" | "Image" | "Contract" | "Spreadsheet" | "Other";
  uploader: string;
  upload_date: string;
  entity_type: "lead" | "contact" | "property";
  entity_id: string;
  size: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  user: string;
  user_id: string;
  entity: string;
  entity_id: string;
  entity_type: "lead" | "contact" | "property" | "task";
  timestamp: string;
}

export const users = [
  { id: "u1", name: "Alex Rivera", avatar: "AR", role: "Admin" },
  { id: "u2", name: "Jordan Kim", avatar: "JK", role: "Agent" },
  { id: "u3", name: "Sam Chen", avatar: "SC", role: "Agent" },
  { id: "u4", name: "Taylor Brooks", avatar: "TB", role: "Agent" },
];

export const contacts: Contact[] = [
  { id: "c1", name: "Maria Santos", email: "maria@email.com", phone: "(512) 555-0142", type: "Seller", tags: ["Motivated", "Probate"], created_at: "2024-03-01" },
  { id: "c2", name: "James Whitfield", email: "james.w@email.com", phone: "(512) 555-0198", type: "Buyer", tags: ["Cash Buyer", "Investor"], created_at: "2024-02-15" },
  { id: "c3", name: "Linda Park", email: "linda.park@email.com", phone: "(512) 555-0276", type: "Seller", tags: ["Absentee Owner"], created_at: "2024-03-10" },
  { id: "c4", name: "Robert Johnson", email: "rjohnson@email.com", phone: "(512) 555-0334", type: "Buyer", tags: ["First Time Buyer"], created_at: "2024-01-20" },
  { id: "c5", name: "Angela Torres", email: "a.torres@email.com", phone: "(512) 555-0411", type: "Agent", tags: ["Referral Partner"], created_at: "2024-02-28" },
  { id: "c6", name: "David Chen", email: "d.chen@email.com", phone: "(512) 555-0523", type: "Seller", tags: ["Pre-Foreclosure"], created_at: "2024-03-15" },
  { id: "c7", name: "Patricia Williams", email: "pwilliams@email.com", phone: "(512) 555-0687", type: "Other", tags: ["Title Company"], created_at: "2024-01-05" },
  { id: "c8", name: "Marcus Green", email: "m.green@email.com", phone: "(512) 555-0791", type: "Buyer", tags: ["Cash Buyer"], created_at: "2024-03-20" },
  { id: "c9", name: "Sandra Lee", email: "s.lee@email.com", phone: "(512) 555-0855", type: "Seller", tags: ["Motivated", "Divorce"], created_at: "2024-03-22" },
  { id: "c10", name: "Victor Ramirez", email: "v.ramirez@email.com", phone: "(512) 555-0912", type: "Agent", tags: ["Listing Agent"], created_at: "2024-02-10" },
  { id: "c11", name: "Karen Mitchell", email: "k.mitchell@email.com", phone: "(512) 555-1023", type: "Seller", tags: ["Estate Sale", "Motivated"], created_at: "2024-03-25" },
  { id: "c12", name: "Thomas Wright", email: "t.wright@email.com", phone: "(512) 555-1134", type: "Buyer", tags: ["Investor", "Flipper"], created_at: "2024-01-30" },
  { id: "c13", name: "Jennifer Adams", email: "j.adams@email.com", phone: "(512) 555-1245", type: "Agent", tags: ["Buyer's Agent", "Referral Partner"], created_at: "2024-02-05" },
  { id: "c14", name: "Michael Brown", email: "m.brown@email.com", phone: "(512) 555-1356", type: "Seller", tags: ["Absentee Owner", "Out of State"], created_at: "2024-03-28" },
  { id: "c15", name: "Rachel Foster", email: "r.foster@email.com", phone: "(512) 555-1467", type: "Buyer", tags: ["Cash Buyer", "1031 Exchange"], created_at: "2024-04-01" },
  { id: "c16", name: "Daniel Ortiz", email: "d.ortiz@email.com", phone: "(512) 555-1578", type: "Other", tags: ["Contractor", "Rehab"], created_at: "2024-01-12" },
  { id: "c17", name: "Susan Taylor", email: "s.taylor@email.com", phone: "(512) 555-1689", type: "Seller", tags: ["Divorce", "Pre-Foreclosure"], created_at: "2024-04-02" },
  { id: "c18", name: "Chris Nguyen", email: "c.nguyen@email.com", phone: "(512) 555-1790", type: "Buyer", tags: ["Investor", "Portfolio Buyer"], created_at: "2024-02-22" },
  { id: "c19", name: "Amanda Clark", email: "a.clark@email.com", phone: "(512) 555-1801", type: "Agent", tags: ["Commercial Agent"], created_at: "2024-03-05" },
  { id: "c20", name: "Steven Harris", email: "s.harris@email.com", phone: "(512) 555-1912", type: "Seller", tags: ["Motivated", "Tax Delinquent", "Vacant"], created_at: "2024-04-03" },
  { id: "c21", name: "Laura Bennett", email: "l.bennett@email.com", phone: "(512) 555-2023", type: "Other", tags: ["Lender", "Hard Money"], created_at: "2024-01-18" },
  { id: "c22", name: "Brian Cooper", email: "b.cooper@email.com", phone: "(512) 555-2134", type: "Buyer", tags: ["First Time Buyer", "FHA"], created_at: "2024-03-30" },
  { id: "c23", name: "Nicole Reed", email: "n.reed@email.com", phone: "(512) 555-2245", type: "Seller", tags: ["Inherited Property"], created_at: "2024-04-04" },
  { id: "c24", name: "Jason Patel", email: "j.patel@email.com", phone: "(512) 555-2356", type: "Buyer", tags: ["Cash Buyer", "Investor", "Multi-Family"], created_at: "2024-02-08" },
  { id: "c25", name: "Megan Ross", email: "m.ross@email.com", phone: "(512) 555-2467", type: "Agent", tags: ["Referral Partner", "Top Producer"], created_at: "2024-03-12" },
  { id: "c26", name: "Derek Howard", email: "d.howard@email.com", phone: "(512) 555-2578", type: "Other", tags: ["Inspector"], created_at: "2024-01-25" },
  { id: "c27", name: "Stephanie King", email: "s.king@email.com", phone: "(512) 555-2689", type: "Seller", tags: ["Relocation", "Motivated"], created_at: "2024-04-05" },
  { id: "c28", name: "Ryan Murphy", email: "r.murphy@email.com", phone: "(512) 555-2790", type: "Buyer", tags: ["Investor", "Wholesale Buyer"], created_at: "2024-03-18" },
  { id: "c29", name: "Diana Flores", email: "d.flores@email.com", phone: "(512) 555-2801", type: "Agent", tags: ["Listing Agent", "Luxury"], created_at: "2024-02-14" },
  { id: "c30", name: "Kevin Scott", email: "k.scott@email.com", phone: "(512) 555-2912", type: "Other", tags: ["Attorney", "Probate"], created_at: "2024-01-08" },
  { id: "c31", name: "Ashley Turner", email: "a.turner@email.com", phone: "(512) 555-3023", type: "Seller", tags: ["Vacant Property", "Absentee Owner"], created_at: "2024-04-06" },
  { id: "c32", name: "Nathan Collins", email: "n.collins@email.com", phone: "(512) 555-3134", type: "Buyer", tags: ["Cash Buyer"], created_at: "2024-03-22" },
  { id: "c33", name: "Olivia Martinez", email: "o.martinez@email.com", phone: "(512) 555-3245", type: "Seller", tags: ["Pre-Foreclosure", "Motivated", "Tax Delinquent", "Liens"], created_at: "2024-04-07" },
  { id: "c34", name: "William Davis", email: "w.davis@email.com", phone: "(512) 555-3356", type: "Other", tags: ["Property Manager"], created_at: "2024-02-20" },
  { id: "c35", name: "Emily Robinson", email: "e.robinson@email.com", phone: "(512) 555-3467", type: "Buyer", tags: ["Investor", "Land Buyer"], created_at: "2024-03-08" },
];

export const properties: Property[] = [
  { id: "p1", address: "4521 Oak Ridge Dr", city: "Austin", state: "TX", zip: "78745", type: "Single Family", beds: 3, baths: 2, sqft: 1850, arv: 385000, asking_price: 275000, offer_price: 260000, status: "Under Contract", thumbnail: "", created_at: "2024-03-01" },
  { id: "p2", address: "912 Elm Street", city: "Austin", state: "TX", zip: "78702", type: "Single Family", beds: 4, baths: 3, sqft: 2400, arv: 520000, asking_price: 425000, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-02-20" },
  { id: "p3", address: "1800 Congress Ave #4B", city: "Austin", state: "TX", zip: "78701", type: "Condo", beds: 2, baths: 2, sqft: 1100, arv: 310000, asking_price: 285000, offer_price: 270000, status: "Available", thumbnail: "", created_at: "2024-03-05" },
  { id: "p4", address: "7234 Sunset Blvd", city: "Round Rock", state: "TX", zip: "78681", type: "Single Family", beds: 5, baths: 4, sqft: 3200, arv: 620000, asking_price: 510000, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-03-12" },
  { id: "p5", address: "3100 Manor Rd", city: "Austin", state: "TX", zip: "78723", type: "Multi Family", beds: 6, baths: 4, sqft: 2800, arv: 450000, asking_price: 340000, offer_price: 320000, status: "Sold", thumbnail: "", created_at: "2024-01-15" },
  { id: "p6", address: "456 Industrial Pkwy", city: "Cedar Park", state: "TX", zip: "78613", type: "Commercial", beds: 0, baths: 2, sqft: 5000, arv: 750000, asking_price: 600000, offer_price: null, status: "Off Market", thumbnail: "", created_at: "2024-02-01" },
  { id: "p7", address: "2208 Lamar Blvd", city: "Austin", state: "TX", zip: "78705", type: "Townhouse", beds: 3, baths: 2, sqft: 1650, arv: 420000, asking_price: 350000, offer_price: 335000, status: "Under Contract", thumbnail: "", created_at: "2024-03-18" },
  { id: "p8", address: "9901 Anderson Mill Rd", city: "Austin", state: "TX", zip: "78750", type: "Single Family", beds: 4, baths: 3, sqft: 2100, arv: 475000, asking_price: 380000, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-03-25" },
  { id: "p9", address: "555 Riverside Dr", city: "Pflugerville", state: "TX", zip: "78660", type: "Single Family", beds: 3, baths: 2, sqft: 1700, arv: 340000, asking_price: 265000, offer_price: 250000, status: "Available", thumbnail: "", created_at: "2024-03-28" },
  { id: "p10", address: "1122 Burnet Rd", city: "Austin", state: "TX", zip: "78757", type: "Single Family", beds: 3, baths: 2, sqft: 1550, arv: 365000, asking_price: 280000, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-04-01" },
  { id: "p11", address: "4400 Red River St", city: "Austin", state: "TX", zip: "78751", type: "Multi Family", beds: 8, baths: 6, sqft: 4200, arv: 890000, asking_price: 720000, offer_price: 695000, status: "Under Contract", thumbnail: "", created_at: "2024-03-15" },
  { id: "p12", address: "600 W. 28th St", city: "Austin", state: "TX", zip: "78705", type: "Condo", beds: 1, baths: 1, sqft: 750, arv: 225000, asking_price: 195000, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-04-02" },
  { id: "p13", address: "8800 Shoal Creek Blvd", city: "Austin", state: "TX", zip: "78757", type: "Single Family", beds: 4, baths: 2.5, sqft: 2350, arv: 545000, asking_price: 430000, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-04-03" },
  { id: "p14", address: "3300 E. Whitestone Blvd", city: "Cedar Park", state: "TX", zip: "78613", type: "Commercial", beds: 0, baths: 4, sqft: 8500, arv: 1200000, asking_price: 950000, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-03-20" },
  { id: "p15", address: "201 Chisholm Trail", city: "Round Rock", state: "TX", zip: "78681", type: "Single Family", beds: 3, baths: 2, sqft: 1900, arv: 395000, asking_price: 310000, offer_price: 295000, status: "Sold", thumbnail: "", created_at: "2024-02-10" },
  { id: "p16", address: "7700 Parmer Ln #210", city: "Austin", state: "TX", zip: "78729", type: "Condo", beds: 2, baths: 2, sqft: 1050, arv: 275000, asking_price: 230000, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-04-04" },
  { id: "p17", address: "1500 S. Pleasant Valley", city: "Austin", state: "TX", zip: "78741", type: "Single Family", beds: 2, baths: 1, sqft: 950, arv: 290000, asking_price: 215000, offer_price: 200000, status: "Sold", thumbnail: "", created_at: "2024-01-28" },
  { id: "p18", address: "920 FM 1431", city: "Leander", state: "TX", zip: "78641", type: "Land", beds: 0, baths: 0, sqft: 43560, arv: 180000, asking_price: 125000, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-03-30" },
  { id: "p19", address: "2505 Lake Austin Blvd", city: "Austin", state: "TX", zip: "78703", type: "Single Family", beds: 5, baths: 4.5, sqft: 4100, arv: 1450000, asking_price: 1200000, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-04-05" },
  { id: "p20", address: "410 Guadalupe St #302", city: "Austin", state: "TX", zip: "78701", type: "Condo", beds: 2, baths: 2, sqft: 1200, arv: 380000, asking_price: 325000, offer_price: 310000, status: "Under Contract", thumbnail: "", created_at: "2024-04-01" },
  { id: "p21", address: "6600 N. Lamar Blvd", city: "Austin", state: "TX", zip: "78752", type: "Commercial", beds: 0, baths: 3, sqft: 6200, arv: 920000, asking_price: 780000, offer_price: null, status: "Off Market", thumbnail: "", created_at: "2024-02-15" },
  { id: "p22", address: "3200 Duval Rd", city: "Austin", state: "TX", zip: "78759", type: "Single Family", beds: 4, baths: 3, sqft: 2650, arv: 580000, asking_price: 465000, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-04-06" },
  { id: "p23", address: "1800 E. Palm Valley Blvd", city: "Round Rock", state: "TX", zip: "78664", type: "Multi Family", beds: 4, baths: 3, sqft: 2200, arv: 410000, asking_price: 325000, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-04-02" },
  { id: "p24", address: "5100 Old Settlers Blvd", city: "Round Rock", state: "TX", zip: "78665", type: "Townhouse", beds: 3, baths: 2.5, sqft: 1800, arv: 375000, asking_price: 295000, offer_price: 280000, status: "Sold", thumbnail: "", created_at: "2024-02-20" },
  { id: "p25", address: "12300 Dessau Rd", city: "Austin", state: "TX", zip: "78754", type: "Single Family", beds: 3, baths: 2, sqft: 1450, arv: 310000, asking_price: 240000, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-04-07" },
  { id: "p26", address: "700 S. 1st St", city: "Austin", state: "TX", zip: "78704", type: "Land", beds: 0, baths: 0, sqft: 21780, arv: 350000, asking_price: 275000, offer_price: null, status: "Off Market", thumbnail: "", created_at: "2024-03-08" },
  { id: "p27", address: "4900 Pecan Park Blvd", city: "Cedar Park", state: "TX", zip: "78613", type: "Single Family", beds: 4, baths: 3, sqft: 2700, arv: 525000, asking_price: 420000, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-04-06" },
  { id: "p28", address: "2100 Wickersham Ln", city: "Austin", state: "TX", zip: "78741", type: "Multi Family", beds: 6, baths: 4, sqft: 3100, arv: 485000, asking_price: 375000, offer_price: 360000, status: "Under Contract", thumbnail: "", created_at: "2024-03-28" },
];

export const leads: Lead[] = [
  // New (15)
  { id: "l1", title: "Oak Ridge Wholesale Deal", stage: "contract", priority: "High", source: "Direct Mail", estimated_value: 45000, next_follow_up: "2024-04-12", tags: ["Wholesale", "Hot"], contact_id: "c1", property_id: "p1", assigned_user: "u1", created_at: "2024-03-01" },
  { id: "l2", title: "Elm Street Flip Opportunity", stage: "tour", priority: "Medium", source: "Referral", estimated_value: 65000, next_follow_up: "2024-04-10", tags: ["Flip"], contact_id: "c3", property_id: "p2", assigned_user: "u2", created_at: "2024-02-20" },
  { id: "l3", title: "Congress Ave Condo Assignment", stage: "offer", priority: "High", source: "Zillow", estimated_value: 25000, next_follow_up: "2024-04-08", tags: ["Assignment"], contact_id: "c2", property_id: "p3", assigned_user: "u1", created_at: "2024-03-05" },
  { id: "l4", title: "Sunset Blvd Listing Lead", stage: "contacted", priority: "Low", source: "Cold Call", estimated_value: 110000, next_follow_up: "2024-04-15", tags: ["Listing"], contact_id: "c4", property_id: "p4", assigned_user: "u3", created_at: "2024-03-12" },
  { id: "l5", title: "Manor Rd Multi-Family", stage: "closed", priority: "Medium", source: "Website", estimated_value: 80000, next_follow_up: null, tags: ["Multi-Family", "Closed"], contact_id: "c6", property_id: "p5", assigned_user: "u2", created_at: "2024-01-15" },
  { id: "l6", title: "Pre-Foreclosure Lead - Chen", stage: "new", priority: "Urgent", source: "Driving for Dollars", estimated_value: 35000, next_follow_up: "2024-04-09", tags: ["Pre-Foreclosure", "Urgent"], contact_id: "c6", property_id: null, assigned_user: "u4", created_at: "2024-03-15" },
  { id: "l7", title: "Buyer Lead - Robert J.", stage: "new", priority: "Medium", source: "Facebook Ads", estimated_value: 0, next_follow_up: "2024-04-11", tags: ["Buyer"], contact_id: "c4", property_id: null, assigned_user: "u3", created_at: "2024-03-18" },
  { id: "l8", title: "Industrial Property Inquiry", stage: "dead", priority: "Low", source: "Website", estimated_value: 0, next_follow_up: null, tags: ["Commercial"], contact_id: "c7", property_id: "p6", assigned_user: "u1", created_at: "2024-02-01" },
  // More leads for realistic pipeline numbers
  { id: "l9", title: "Lamar Blvd Townhouse Flip", stage: "contract", priority: "High", source: "Referral", estimated_value: 55000, next_follow_up: "2024-04-13", tags: ["Flip", "Hot"], contact_id: "c8", property_id: "p7", assigned_user: "u1", created_at: "2024-03-18" },
  { id: "l10", title: "Anderson Mill Listing", stage: "contacted", priority: "Medium", source: "Cold Call", estimated_value: 95000, next_follow_up: "2024-04-10", tags: ["Listing"], contact_id: "c9", property_id: "p8", assigned_user: "u2", created_at: "2024-03-25" },
  { id: "l11", title: "Riverside Dr Wholesale", stage: "offer", priority: "High", source: "Direct Mail", estimated_value: 40000, next_follow_up: "2024-04-09", tags: ["Wholesale"], contact_id: "c9", property_id: "p9", assigned_user: "u4", created_at: "2024-03-28" },
  { id: "l12", title: "Investor Buyer - Marcus G.", stage: "new", priority: "Low", source: "Website", estimated_value: 0, next_follow_up: "2024-04-14", tags: ["Buyer"], contact_id: "c8", property_id: null, assigned_user: "u3", created_at: "2024-03-20" },
  { id: "l13", title: "Probate Lead - West Campus", stage: "new", priority: "High", source: "Probate List", estimated_value: 70000, next_follow_up: "2024-04-08", tags: ["Probate", "Motivated"], contact_id: "c1", property_id: null, assigned_user: "u1", created_at: "2024-04-01" },
  { id: "l14", title: "Divorce Sale - Sandra Lee", stage: "new", priority: "Urgent", source: "Attorney Referral", estimated_value: 42000, next_follow_up: "2024-04-08", tags: ["Motivated", "Divorce"], contact_id: "c9", property_id: null, assigned_user: "u4", created_at: "2024-04-02" },
  { id: "l15", title: "REO - Bank Owned Property", stage: "new", priority: "Medium", source: "REO List", estimated_value: 55000, next_follow_up: "2024-04-11", tags: ["REO"], contact_id: "c10", property_id: null, assigned_user: "u2", created_at: "2024-04-03" },
  { id: "l16", title: "Cold Call Lead - S. Lamar", stage: "new", priority: "Low", source: "Cold Call", estimated_value: 0, next_follow_up: "2024-04-16", tags: [], contact_id: "c3", property_id: null, assigned_user: "u3", created_at: "2024-04-04" },
  { id: "l17", title: "Absentee Owner - Rundberg", stage: "new", priority: "Medium", source: "Skip Trace", estimated_value: 30000, next_follow_up: "2024-04-12", tags: ["Absentee"], contact_id: "c3", property_id: null, assigned_user: "u1", created_at: "2024-04-05" },
  { id: "l18", title: "Facebook Ad Lead - Williams", stage: "new", priority: "Low", source: "Facebook Ads", estimated_value: 0, next_follow_up: "2024-04-13", tags: ["Buyer"], contact_id: "c7", property_id: null, assigned_user: "u2", created_at: "2024-04-05" },
  { id: "l19", title: "Google PPC Lead - Pflugerville", stage: "new", priority: "Medium", source: "Google Ads", estimated_value: 28000, next_follow_up: "2024-04-10", tags: ["Seller"], contact_id: "c6", property_id: null, assigned_user: "u4", created_at: "2024-04-06" },
  { id: "l20", title: "Referral - Torres Network", stage: "new", priority: "High", source: "Referral", estimated_value: 50000, next_follow_up: "2024-04-09", tags: ["Referral", "Hot"], contact_id: "c5", property_id: null, assigned_user: "u1", created_at: "2024-04-07" },
  { id: "l21", title: "Drive4Dollars - E. Cesar Chavez", stage: "new", priority: "Medium", source: "Driving for Dollars", estimated_value: 38000, next_follow_up: "2024-04-11", tags: ["Distressed"], contact_id: "c6", property_id: null, assigned_user: "u3", created_at: "2024-04-07" },
  { id: "l22", title: "Texting Campaign - Batch 12", stage: "new", priority: "Low", source: "SMS Campaign", estimated_value: 0, next_follow_up: "2024-04-15", tags: ["SMS"], contact_id: "c4", property_id: null, assigned_user: "u2", created_at: "2024-04-07" },
  { id: "l23", title: "Bandit Sign Lead - N. Lamar", stage: "new", priority: "Medium", source: "Bandit Sign", estimated_value: 32000, next_follow_up: "2024-04-10", tags: ["Seller"], contact_id: "c9", property_id: null, assigned_user: "u4", created_at: "2024-04-07" },
  // More contacted
  { id: "l24", title: "SEO Lead - Georgetown Seller", stage: "contacted", priority: "Medium", source: "Website", estimated_value: 60000, next_follow_up: "2024-04-11", tags: ["Seller"], contact_id: "c1", property_id: null, assigned_user: "u1", created_at: "2024-03-20" },
  { id: "l25", title: "Networking Event - Investor", stage: "contacted", priority: "Low", source: "Networking", estimated_value: 0, next_follow_up: "2024-04-14", tags: ["Buyer", "Investor"], contact_id: "c2", property_id: null, assigned_user: "u3", created_at: "2024-03-22" },
  { id: "l26", title: "Referral - Realtor Torres", stage: "contacted", priority: "High", source: "Referral", estimated_value: 75000, next_follow_up: "2024-04-09", tags: ["Seller", "Hot"], contact_id: "c5", property_id: null, assigned_user: "u2", created_at: "2024-03-25" },
  { id: "l27", title: "Cold Call - Cedar Park Owner", stage: "contacted", priority: "Medium", source: "Cold Call", estimated_value: 45000, next_follow_up: "2024-04-12", tags: ["Absentee"], contact_id: "c3", property_id: null, assigned_user: "u4", created_at: "2024-03-27" },
  { id: "l28", title: "Walk-In Inquiry - Office", stage: "contacted", priority: "Low", source: "Walk-In", estimated_value: 0, next_follow_up: "2024-04-16", tags: ["Buyer"], contact_id: "c4", property_id: null, assigned_user: "u1", created_at: "2024-03-30" },
  { id: "l29", title: "Voicemail Follow-Up - Ramirez", stage: "contacted", priority: "Medium", source: "Cold Call", estimated_value: 50000, next_follow_up: "2024-04-10", tags: ["Seller"], contact_id: "c10", property_id: null, assigned_user: "u3", created_at: "2024-04-01" },
  { id: "l30", title: "Text Response - Tax Delinquent", stage: "contacted", priority: "High", source: "SMS Campaign", estimated_value: 35000, next_follow_up: "2024-04-08", tags: ["Tax Delinquent", "Motivated"], contact_id: "c6", property_id: null, assigned_user: "u2", created_at: "2024-04-03" },
  { id: "l31", title: "Direct Mail Response - Wells", stage: "contacted", priority: "Medium", source: "Direct Mail", estimated_value: 40000, next_follow_up: "2024-04-11", tags: ["Seller"], contact_id: "c7", property_id: null, assigned_user: "u4", created_at: "2024-04-04" },
  { id: "l32", title: "Zillow Seller Lead - Buda", stage: "contacted", priority: "Low", source: "Zillow", estimated_value: 55000, next_follow_up: "2024-04-13", tags: ["Listing"], contact_id: "c9", property_id: null, assigned_user: "u1", created_at: "2024-04-05" },
  { id: "l33", title: "Email Response - Green", stage: "contacted", priority: "Medium", source: "Email Campaign", estimated_value: 0, next_follow_up: "2024-04-12", tags: ["Buyer"], contact_id: "c8", property_id: null, assigned_user: "u3", created_at: "2024-04-06" },
  { id: "l34", title: "Radio Ad Response", stage: "contacted", priority: "Low", source: "Radio Ad", estimated_value: 28000, next_follow_up: "2024-04-15", tags: ["Seller"], contact_id: "c1", property_id: null, assigned_user: "u2", created_at: "2024-04-07" },
  // More tour
  { id: "l35", title: "Tour Scheduled - Manor Area", stage: "tour", priority: "High", source: "Referral", estimated_value: 58000, next_follow_up: "2024-04-09", tags: ["Wholesale"], contact_id: "c6", property_id: null, assigned_user: "u1", created_at: "2024-03-28" },
  { id: "l36", title: "Property Walkthrough - 78702", stage: "tour", priority: "Medium", source: "Direct Mail", estimated_value: 72000, next_follow_up: "2024-04-10", tags: ["Flip"], contact_id: "c3", property_id: null, assigned_user: "u4", created_at: "2024-04-01" },
  { id: "l37", title: "Investor Tour - Downtown", stage: "tour", priority: "High", source: "Networking", estimated_value: 90000, next_follow_up: "2024-04-08", tags: ["Investor", "Hot"], contact_id: "c8", property_id: null, assigned_user: "u2", created_at: "2024-04-03" },
  { id: "l38", title: "Seller Showing - Pflugerville", stage: "tour", priority: "Medium", source: "Cold Call", estimated_value: 44000, next_follow_up: "2024-04-11", tags: ["Seller"], contact_id: "c9", property_id: null, assigned_user: "u3", created_at: "2024-04-05" },
  { id: "l39", title: "Multi-Unit Tour - E. Riverside", stage: "tour", priority: "High", source: "Website", estimated_value: 120000, next_follow_up: "2024-04-09", tags: ["Multi-Family", "Hot"], contact_id: "c2", property_id: null, assigned_user: "u1", created_at: "2024-04-06" },
  { id: "l40", title: "Commercial Tour - N. Austin", stage: "tour", priority: "Low", source: "Referral", estimated_value: 85000, next_follow_up: "2024-04-14", tags: ["Commercial"], contact_id: "c10", property_id: null, assigned_user: "u4", created_at: "2024-04-07" },
  // More offer
  { id: "l41", title: "Counter Offer - Barton Hills", stage: "offer", priority: "High", source: "Direct Mail", estimated_value: 68000, next_follow_up: "2024-04-08", tags: ["Wholesale", "Counter"], contact_id: "c1", property_id: null, assigned_user: "u2", created_at: "2024-04-01" },
  { id: "l42", title: "Verbal Offer - Slaughter Ln", stage: "offer", priority: "Medium", source: "Cold Call", estimated_value: 52000, next_follow_up: "2024-04-10", tags: ["Seller"], contact_id: "c9", property_id: null, assigned_user: "u1", created_at: "2024-04-04" },
  { id: "l43", title: "Written Offer - S. Congress", stage: "offer", priority: "Urgent", source: "Referral", estimated_value: 95000, next_follow_up: "2024-04-08", tags: ["Flip", "Hot"], contact_id: "c5", property_id: null, assigned_user: "u3", created_at: "2024-04-06" },
  { id: "l44", title: "LOI Submitted - Industrial", stage: "offer", priority: "Medium", source: "Website", estimated_value: 130000, next_follow_up: "2024-04-11", tags: ["Commercial", "LOI"], contact_id: "c10", property_id: null, assigned_user: "u4", created_at: "2024-04-07" },
  // More contract
  { id: "l45", title: "Under Contract - Wells Branch", stage: "contract", priority: "High", source: "Direct Mail", estimated_value: 48000, next_follow_up: "2024-04-15", tags: ["Wholesale"], contact_id: "c6", property_id: null, assigned_user: "u2", created_at: "2024-03-20" },
  { id: "l46", title: "Pending Close - Round Rock", stage: "contract", priority: "Medium", source: "Referral", estimated_value: 62000, next_follow_up: "2024-04-18", tags: ["Flip"], contact_id: "c8", property_id: null, assigned_user: "u3", created_at: "2024-03-22" },
  // More closed
  { id: "l47", title: "Closed - Cedar Park Duplex", stage: "closed", priority: "Medium", source: "Direct Mail", estimated_value: 72000, next_follow_up: null, tags: ["Wholesale", "Closed"], contact_id: "c3", property_id: null, assigned_user: "u1", created_at: "2024-02-01" },
  { id: "l48", title: "Closed - Pflugerville SFH", stage: "closed", priority: "High", source: "Referral", estimated_value: 58000, next_follow_up: null, tags: ["Flip", "Closed"], contact_id: "c9", property_id: "p9", assigned_user: "u4", created_at: "2024-02-15" },
  { id: "l49", title: "Closed - Buda Land Deal", stage: "closed", priority: "Low", source: "Website", estimated_value: 35000, next_follow_up: null, tags: ["Land", "Closed"], contact_id: "c7", property_id: null, assigned_user: "u2", created_at: "2024-03-01" },
  { id: "l50", title: "Closed - Georgetown Fix&Flip", stage: "closed", priority: "High", source: "Cold Call", estimated_value: 92000, next_follow_up: null, tags: ["Flip", "Closed"], contact_id: "c1", property_id: null, assigned_user: "u1", created_at: "2024-03-10" },
  { id: "l51", title: "Closed - South Austin Condo", stage: "closed", priority: "Medium", source: "Zillow", estimated_value: 28000, next_follow_up: null, tags: ["Assignment", "Closed"], contact_id: "c2", property_id: null, assigned_user: "u3", created_at: "2024-03-15" },
  { id: "l52", title: "Closed - Leander SFH", stage: "closed", priority: "Medium", source: "Direct Mail", estimated_value: 45000, next_follow_up: null, tags: ["Wholesale", "Closed"], contact_id: "c5", property_id: null, assigned_user: "u4", created_at: "2024-03-20" },
  { id: "l53", title: "Closed - Kyle Investment", stage: "closed", priority: "High", source: "Referral", estimated_value: 67000, next_follow_up: null, tags: ["Flip", "Closed"], contact_id: "c8", property_id: null, assigned_user: "u2", created_at: "2024-03-25" },
  { id: "l54", title: "Closed - Manor Wholesale", stage: "closed", priority: "Medium", source: "Driving for Dollars", estimated_value: 41000, next_follow_up: null, tags: ["Wholesale", "Closed"], contact_id: "c6", property_id: null, assigned_user: "u1", created_at: "2024-04-01" },
];

export const tasks: Task[] = [
  { id: "t1", title: "Call Maria Santos - follow up on offer", description: "Discuss counter-offer terms for Oak Ridge property", completed: false, due_date: "2024-04-08", priority: "High", assigned_user: "u1", linked_entity: { type: "lead", id: "l1", name: "Oak Ridge Wholesale Deal" }, created_at: "2024-04-01" },
  { id: "t2", title: "Schedule property tour - Elm Street", description: "Coordinate with Linda Park for property walkthrough", completed: false, due_date: "2024-04-09", priority: "Medium", assigned_user: "u2", linked_entity: { type: "lead", id: "l2", name: "Elm Street Flip Opportunity" }, created_at: "2024-04-02" },
  { id: "t3", title: "Send comps to James Whitfield", description: "Pull comparable sales for Congress Ave area", completed: true, due_date: "2024-04-07", priority: "Low", assigned_user: "u1", linked_entity: { type: "contact", id: "c2", name: "James Whitfield" }, created_at: "2024-04-01" },
  { id: "t4", title: "Submit offer - Congress Ave Condo", description: "Prepare and submit assignment contract", completed: false, due_date: "2024-04-08", priority: "High", assigned_user: "u1", linked_entity: { type: "lead", id: "l3", name: "Congress Ave Condo Assignment" }, created_at: "2024-04-03" },
  { id: "t5", title: "Research pre-foreclosure timeline", description: "Check county records for Chen property foreclosure status", completed: false, due_date: "2024-04-10", priority: "High", assigned_user: "u4", linked_entity: { type: "lead", id: "l6", name: "Pre-Foreclosure Lead - Chen" }, created_at: "2024-04-05" },
  { id: "t6", title: "Update CRM with new buyer criteria", description: "Robert wants 4+ beds, under $500k, Austin area", completed: false, due_date: "2024-04-12", priority: "Low", assigned_user: "u3", linked_entity: { type: "contact", id: "c4", name: "Robert Johnson" }, created_at: "2024-04-06" },
  { id: "t7", title: "Order title search - Oak Ridge", description: "Contact Patricia at title company", completed: false, due_date: "2024-04-06", priority: "High", assigned_user: "u1", linked_entity: { type: "property", id: "p1", name: "4521 Oak Ridge Dr" }, created_at: "2024-03-28" },
  { id: "t8", title: "Review inspection report - Elm St", description: "Check for major issues flagged by inspector", completed: false, due_date: "2024-04-08", priority: "Medium", assigned_user: "u2", linked_entity: { type: "property", id: "p2", name: "912 Elm Street" }, created_at: "2024-04-04" },
  { id: "t9", title: "Prepare closing docs - Oak Ridge", description: "Coordinate with title company for closing package", completed: false, due_date: "2024-04-09", priority: "High", assigned_user: "u1", linked_entity: { type: "lead", id: "l1", name: "Oak Ridge Wholesale Deal" }, created_at: "2024-04-05" },
  { id: "t10", title: "Follow up with Sandra Lee", description: "She texted back interested - call to schedule meeting", completed: false, due_date: "2024-04-08", priority: "High", assigned_user: "u4", linked_entity: { type: "lead", id: "l14", name: "Divorce Sale - Sandra Lee" }, created_at: "2024-04-06" },
  { id: "t11", title: "Send assignment contract to buyer", description: "James Whitfield is the end buyer for Congress Ave deal", completed: false, due_date: "2024-04-09", priority: "Medium", assigned_user: "u1", linked_entity: { type: "lead", id: "l3", name: "Congress Ave Condo Assignment" }, created_at: "2024-04-07" },
  { id: "t12", title: "Pull skip trace for Rundberg lead", description: "Need owner contact info for absentee property", completed: false, due_date: "2024-04-10", priority: "Low", assigned_user: "u1", linked_entity: { type: "lead", id: "l17", name: "Absentee Owner - Rundberg" }, created_at: "2024-04-07" },
  { id: "t13", title: "Drive by 912 Elm Street", description: "Take photos of exterior and neighborhood for buyer presentation", completed: true, due_date: "2024-04-05", priority: "Medium", assigned_user: "u2", linked_entity: { type: "property", id: "p2", name: "912 Elm Street" }, created_at: "2024-04-01" },
  { id: "t14", title: "Call contractor for rehab estimate", description: "Get bid for kitchen, bath, and flooring at Oak Ridge", completed: false, due_date: "2024-04-05", priority: "High", assigned_user: "u1", linked_entity: { type: "property", id: "p1", name: "4521 Oak Ridge Dr" }, created_at: "2024-03-30" },
  { id: "t15", title: "Email buyer list - new wholesale deal", description: "Blast Anderson Mill property to cash buyer list", completed: false, due_date: "2024-04-11", priority: "Medium", assigned_user: "u2", linked_entity: { type: "property", id: "p8", name: "9901 Anderson Mill Rd" }, created_at: "2024-04-06" },
  { id: "t16", title: "Verify seller identity - Torres referral", description: "Request ID and proof of ownership before proceeding", completed: false, due_date: "2024-04-09", priority: "High", assigned_user: "u2", linked_entity: { type: "lead", id: "l26", name: "Referral - Realtor Torres" }, created_at: "2024-04-05" },
  { id: "t17", title: "Schedule home inspection - Lamar Blvd", description: "Book licensed inspector for townhouse", completed: true, due_date: "2024-04-04", priority: "Medium", assigned_user: "u1", linked_entity: { type: "property", id: "p7", name: "2208 Lamar Blvd" }, created_at: "2024-03-28" },
  { id: "t18", title: "Update disposition spreadsheet", description: "Add closed deals from March to tracking sheet", completed: false, due_date: "2024-04-15", priority: "Low", assigned_user: "u3", linked_entity: null, created_at: "2024-04-07" },
  { id: "t19", title: "Follow up cold call batch #47", description: "Call back 12 prospects from Tuesday's session", completed: false, due_date: "2024-04-08", priority: "Medium", assigned_user: "u3", linked_entity: null, created_at: "2024-04-06" },
  { id: "t20", title: "Send earnest money - Wells Branch", description: "Wire $5K earnest money to title company", completed: false, due_date: "2024-04-07", priority: "High", assigned_user: "u2", linked_entity: { type: "lead", id: "l45", name: "Under Contract - Wells Branch" }, created_at: "2024-04-04" },
  { id: "t21", title: "Review HOA docs - Congress Ave", description: "Check for rental restrictions and special assessments", completed: false, due_date: "2024-04-11", priority: "Medium", assigned_user: "u1", linked_entity: { type: "property", id: "p3", name: "1800 Congress Ave #4B" }, created_at: "2024-04-07" },
  { id: "t22", title: "Set up auto-drip for new leads", description: "Configure email sequence for website leads", completed: false, due_date: "2024-04-14", priority: "Low", assigned_user: "u4", linked_entity: null, created_at: "2024-04-07" },
  { id: "t23", title: "Negotiate repair credits - Sunset Blvd", description: "Seller agreed to discuss credits after inspection", completed: false, due_date: "2024-04-10", priority: "High", assigned_user: "u3", linked_entity: { type: "property", id: "p4", name: "7234 Sunset Blvd" }, created_at: "2024-04-06" },
  { id: "t24", title: "Order appraisal - Pflugerville SFH", description: "Lender requires appraisal for end buyer financing", completed: true, due_date: "2024-04-03", priority: "High", assigned_user: "u4", linked_entity: { type: "property", id: "p9", name: "555 Riverside Dr" }, created_at: "2024-03-28" },
  { id: "t25", title: "Team meeting prep - weekly pipeline review", description: "Prepare pipeline report and deal status updates", completed: false, due_date: "2024-04-08", priority: "Medium", assigned_user: "u1", linked_entity: null, created_at: "2024-04-07" },
  { id: "t26", title: "Send thank you note to Angela Torres", description: "Thank her for the Realtor referral lead", completed: false, due_date: "2024-04-12", priority: "Low", assigned_user: "u2", linked_entity: { type: "contact", id: "c5", name: "Angela Torres" }, created_at: "2024-04-07" },
  { id: "t27", title: "Check tax records - Dessau Rd property", description: "Verify property taxes and any outstanding liens", completed: false, due_date: "2024-04-09", priority: "Medium", assigned_user: "u1", linked_entity: { type: "property", id: "p25", name: "12300 Dessau Rd" }, created_at: "2024-04-07" },
  { id: "t28", title: "Draft LOI for industrial property", description: "Prepare letter of intent for 456 Industrial Pkwy", completed: false, due_date: "2024-04-11", priority: "High", assigned_user: "u4", linked_entity: { type: "lead", id: "l44", name: "LOI Submitted - Industrial" }, created_at: "2024-04-07" },
];

export const notes: Note[] = [
  { id: "n1", content: "Spoke with Maria. She's motivated to sell quickly due to relocation. Willing to accept below asking if we can close in 30 days.", author: "u1", entity_type: "lead", entity_id: "l1", created_at: "2024-03-15T14:30:00" },
  { id: "n2", content: "Property needs new roof and HVAC. Estimated rehab costs ~$45K. ARV still makes this a solid deal.", author: "u2", entity_type: "lead", entity_id: "l2", created_at: "2024-03-20T10:15:00" },
  { id: "n3", content: "James is looking for properties in the $250-350K range. Prefers east Austin. Cash buyer, can close in 2 weeks.", author: "u1", entity_type: "contact", entity_id: "c2", created_at: "2024-02-18T09:00:00" },
  { id: "n4", content: "HOA confirmed monthly dues at $285. Building has upcoming assessment for lobby renovation.", author: "u1", entity_type: "property", entity_id: "p3", created_at: "2024-03-08T16:45:00" },
];

export const meetings: Meeting[] = [
  { id: "m1", title: "Property Tour - Elm Street", date: "2024-04-10", time: "10:00 AM", duration: "1 hour", attendees: ["u2", "c3"], entity_type: "lead", entity_id: "l2", notes: "Bring contractor for rehab estimate", created_at: "2024-04-02" },
  { id: "m2", title: "Closing Meeting - Oak Ridge", date: "2024-04-18", time: "2:00 PM", duration: "2 hours", attendees: ["u1", "c1", "c7"], entity_type: "lead", entity_id: "l1", notes: "At title company office. Bring all signed docs.", created_at: "2024-04-05" },
  { id: "m3", title: "Buyer Consultation - Robert", date: "2024-04-11", time: "3:00 PM", duration: "45 min", attendees: ["u3", "c4"], entity_type: "contact", entity_id: "c4", notes: "Review buyer criteria and available inventory", created_at: "2024-04-06" },
];

export const documents: DocFile[] = [
  { id: "d1", filename: "Purchase_Agreement_OakRidge.pdf", type: "Contract", uploader: "u1", upload_date: "2024-03-20", entity_type: "lead", entity_id: "l1", size: "2.4 MB" },
  { id: "d2", filename: "Inspection_Report_ElmSt.pdf", type: "PDF", uploader: "u2", upload_date: "2024-03-22", entity_type: "property", entity_id: "p2", size: "5.1 MB" },
  { id: "d3", filename: "Comps_CongressAve.xlsx", type: "Spreadsheet", uploader: "u1", upload_date: "2024-03-10", entity_type: "lead", entity_id: "l3", size: "1.2 MB" },
  { id: "d4", filename: "Property_Photos_OakRidge.zip", type: "Other", uploader: "u1", upload_date: "2024-03-05", entity_type: "property", entity_id: "p1", size: "18.7 MB" },
  { id: "d5", filename: "Title_Search_ManorRd.pdf", type: "PDF", uploader: "u2", upload_date: "2024-02-10", entity_type: "property", entity_id: "p5", size: "3.8 MB" },
  { id: "d6", filename: "Seller_Disclosure_OakRidge.pdf", type: "Contract", uploader: "u1", upload_date: "2024-03-18", entity_type: "lead", entity_id: "l1", size: "1.8 MB" },
  { id: "d7", filename: "Front_Exterior_ElmSt.jpg", type: "Image", uploader: "u2", upload_date: "2024-03-21", entity_type: "property", entity_id: "p2", size: "4.2 MB" },
  { id: "d8", filename: "Kitchen_Renovation_ElmSt.jpg", type: "Image", uploader: "u2", upload_date: "2024-03-21", entity_type: "property", entity_id: "p2", size: "3.6 MB" },
  { id: "d9", filename: "Assignment_Contract_CongressAve.pdf", type: "Contract", uploader: "u1", upload_date: "2024-03-12", entity_type: "lead", entity_id: "l3", size: "1.5 MB" },
  { id: "d10", filename: "Roof_Inspection_OakRidge.pdf", type: "PDF", uploader: "u1", upload_date: "2024-03-15", entity_type: "property", entity_id: "p1", size: "2.9 MB" },
  { id: "d11", filename: "Survey_Map_SunsetBlvd.pdf", type: "PDF", uploader: "u3", upload_date: "2024-03-14", entity_type: "property", entity_id: "p4", size: "6.3 MB" },
  { id: "d12", filename: "HOA_Bylaws_CongressAve.pdf", type: "PDF", uploader: "u1", upload_date: "2024-03-09", entity_type: "property", entity_id: "p3", size: "4.7 MB" },
  { id: "d13", filename: "Rehab_Budget_ElmSt.xlsx", type: "Spreadsheet", uploader: "u2", upload_date: "2024-03-23", entity_type: "lead", entity_id: "l2", size: "890 KB" },
  { id: "d14", filename: "Backyard_OakRidge.jpg", type: "Image", uploader: "u1", upload_date: "2024-03-06", entity_type: "property", entity_id: "p1", size: "5.4 MB" },
  { id: "d15", filename: "Tax_Records_ManorRd.pdf", type: "PDF", uploader: "u2", upload_date: "2024-02-12", entity_type: "property", entity_id: "p5", size: "1.1 MB" },
  { id: "d16", filename: "Wholesale_Agreement_Template.docx", type: "Contract", uploader: "u1", upload_date: "2024-01-15", entity_type: "lead", entity_id: "l1", size: "320 KB" },
  { id: "d17", filename: "Living_Room_LamarBlvd.jpg", type: "Image", uploader: "u1", upload_date: "2024-03-19", entity_type: "property", entity_id: "p7", size: "3.1 MB" },
  { id: "d18", filename: "Appraisal_Report_Riverside.pdf", type: "PDF", uploader: "u4", upload_date: "2024-03-30", entity_type: "property", entity_id: "p9", size: "7.2 MB" },
  { id: "d19", filename: "Lease_Agreement_RedRiver.pdf", type: "Contract", uploader: "u3", upload_date: "2024-03-16", entity_type: "property", entity_id: "p11", size: "2.1 MB" },
  { id: "d20", filename: "Environmental_Report_Industrial.pdf", type: "PDF", uploader: "u4", upload_date: "2024-02-05", entity_type: "property", entity_id: "p6", size: "8.5 MB" },
  { id: "d21", filename: "Bathroom_Reno_ElmSt.jpg", type: "Image", uploader: "u2", upload_date: "2024-03-21", entity_type: "property", entity_id: "p2", size: "2.8 MB" },
  { id: "d22", filename: "Closing_Statement_ManorRd.pdf", type: "Contract", uploader: "u2", upload_date: "2024-02-15", entity_type: "lead", entity_id: "l5", size: "1.9 MB" },
  { id: "d23", filename: "Contractor_Bid_OakRidge.pdf", type: "PDF", uploader: "u1", upload_date: "2024-03-17", entity_type: "property", entity_id: "p1", size: "980 KB" },
  { id: "d24", filename: "Market_Analysis_78702.xlsx", type: "Spreadsheet", uploader: "u2", upload_date: "2024-03-24", entity_type: "lead", entity_id: "l2", size: "2.3 MB" },
  { id: "d25", filename: "Aerial_View_SunsetBlvd.jpg", type: "Image", uploader: "u3", upload_date: "2024-03-13", entity_type: "property", entity_id: "p4", size: "6.1 MB" },
  { id: "d26", filename: "Lead_Paint_Disclosure.pdf", type: "PDF", uploader: "u1", upload_date: "2024-03-19", entity_type: "lead", entity_id: "l1", size: "540 KB" },
  { id: "d27", filename: "Buyer_Proof_of_Funds.pdf", type: "PDF", uploader: "u1", upload_date: "2024-03-11", entity_type: "contact", entity_id: "c2", size: "1.3 MB" },
  { id: "d28", filename: "Drone_Footage_Screenshot.jpg", type: "Image", uploader: "u4", upload_date: "2024-03-29", entity_type: "property", entity_id: "p9", size: "4.5 MB" },
  { id: "d29", filename: "Insurance_Quote_LamarBlvd.pdf", type: "PDF", uploader: "u1", upload_date: "2024-03-20", entity_type: "property", entity_id: "p7", size: "760 KB" },
  { id: "d30", filename: "Pipeline_Report_Q1.xlsx", type: "Spreadsheet", uploader: "u1", upload_date: "2024-04-01", entity_type: "lead", entity_id: "l1", size: "1.8 MB" },
];

export const activities: ActivityItem[] = [
  { id: "a1", action: "moved lead to Under Contract", user: "Alex Rivera", user_id: "u1", entity: "Oak Ridge Wholesale Deal", entity_id: "l1", entity_type: "lead", timestamp: "2024-04-08T08:30:00" },
  { id: "a2", action: "submitted an offer on", user: "Sam Chen", user_id: "u3", entity: "Written Offer - S. Congress", entity_id: "l43", entity_type: "lead", timestamp: "2024-04-08T07:45:00" },
  { id: "a3", action: "added a note on", user: "Jordan Kim", user_id: "u2", entity: "Elm Street Flip Opportunity", entity_id: "l2", entity_type: "lead", timestamp: "2024-04-07T16:15:00" },
  { id: "a4", action: "created new lead", user: "Taylor Brooks", user_id: "u4", entity: "Divorce Sale - Sandra Lee", entity_id: "l14", entity_type: "lead", timestamp: "2024-04-07T14:30:00" },
  { id: "a5", action: "completed task", user: "Alex Rivera", user_id: "u1", entity: "Send comps to James Whitfield", entity_id: "t3", entity_type: "task", timestamp: "2024-04-07T11:20:00" },
  { id: "a6", action: "uploaded document to", user: "Alex Rivera", user_id: "u1", entity: "Oak Ridge Wholesale Deal", entity_id: "l1", entity_type: "lead", timestamp: "2024-04-07T09:45:00" },
  { id: "a7", action: "scheduled meeting for", user: "Sam Chen", user_id: "u3", entity: "Buyer Consultation - Robert", entity_id: "m3", entity_type: "contact", timestamp: "2024-04-06T15:00:00" },
  { id: "a8", action: "updated property details for", user: "Jordan Kim", user_id: "u2", entity: "912 Elm Street", entity_id: "p2", entity_type: "property", timestamp: "2024-04-06T13:30:00" },
  { id: "a9", action: "changed priority to Urgent on", user: "Taylor Brooks", user_id: "u4", entity: "Pre-Foreclosure Lead - Chen", entity_id: "l6", entity_type: "lead", timestamp: "2024-04-06T10:00:00" },
  { id: "a10", action: "closed deal on", user: "Alex Rivera", user_id: "u1", entity: "Manor Wholesale", entity_id: "l54", entity_type: "lead", timestamp: "2024-04-05T17:00:00" },
  { id: "a11", action: "left voicemail for contact on", user: "Jordan Kim", user_id: "u2", entity: "Anderson Mill Listing", entity_id: "l10", entity_type: "lead", timestamp: "2024-04-05T14:20:00" },
  { id: "a12", action: "created new lead", user: "Alex Rivera", user_id: "u1", entity: "Referral - Torres Network", entity_id: "l20", entity_type: "lead", timestamp: "2024-04-05T11:00:00" },
];

export function getUserById(id: string) {
  return users.find(u => u.id === id);
}

export function getContactById(id: string) {
  return contacts.find(c => c.id === id);
}

export function getPropertyById(id: string) {
  return properties.find(p => p.id === id);
}

export function getLeadById(id: string) {
  return leads.find(l => l.id === id);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function formatCompactCurrency(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export function getStageLabel(stageId: StageId) {
  return PIPELINE_STAGES.find(s => s.id === stageId)?.label ?? stageId;
}

export function timeAgo(timestamp: string): string {
  const now = new Date("2024-04-08T09:00:00");
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}
