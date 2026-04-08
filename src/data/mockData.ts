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
  entity: string;
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
];

export const properties: Property[] = [
  { id: "p1", address: "4521 Oak Ridge Dr", city: "Austin", state: "TX", zip: "78745", type: "Single Family", beds: 3, baths: 2, sqft: 1850, arv: 385000, asking_price: 275000, offer_price: 260000, status: "Under Contract", thumbnail: "", created_at: "2024-03-01" },
  { id: "p2", address: "912 Elm Street", city: "Austin", state: "TX", zip: "78702", type: "Single Family", beds: 4, baths: 3, sqft: 2400, arv: 520000, asking_price: 425000, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-02-20" },
  { id: "p3", address: "1800 Congress Ave #4B", city: "Austin", state: "TX", zip: "78701", type: "Condo", beds: 2, baths: 2, sqft: 1100, arv: 310000, asking_price: 285000, offer_price: 270000, status: "Available", thumbnail: "", created_at: "2024-03-05" },
  { id: "p4", address: "7234 Sunset Blvd", city: "Round Rock", state: "TX", zip: "78681", type: "Single Family", beds: 5, baths: 4, sqft: 3200, arv: 620000, asking_price: 510000, offer_price: null, status: "Available", thumbnail: "", created_at: "2024-03-12" },
  { id: "p5", address: "3100 Manor Rd", city: "Austin", state: "TX", zip: "78723", type: "Multi Family", beds: 6, baths: 4, sqft: 2800, arv: 450000, asking_price: 340000, offer_price: 320000, status: "Sold", thumbnail: "", created_at: "2024-01-15" },
  { id: "p6", address: "456 Industrial Pkwy", city: "Cedar Park", state: "TX", zip: "78613", type: "Commercial", beds: 0, baths: 2, sqft: 5000, arv: 750000, asking_price: 600000, offer_price: null, status: "Off Market", thumbnail: "", created_at: "2024-02-01" },
];

export const leads: Lead[] = [
  { id: "l1", title: "Oak Ridge Wholesale Deal", stage: "contract", priority: "High", source: "Direct Mail", estimated_value: 45000, next_follow_up: "2024-04-12", tags: ["Wholesale", "Hot"], contact_id: "c1", property_id: "p1", assigned_user: "u1", created_at: "2024-03-01" },
  { id: "l2", title: "Elm Street Flip Opportunity", stage: "tour", priority: "Medium", source: "Referral", estimated_value: 65000, next_follow_up: "2024-04-10", tags: ["Flip"], contact_id: "c3", property_id: "p2", assigned_user: "u2", created_at: "2024-02-20" },
  { id: "l3", title: "Congress Ave Condo Assignment", stage: "offer", priority: "High", source: "Zillow", estimated_value: 25000, next_follow_up: "2024-04-08", tags: ["Assignment"], contact_id: "c2", property_id: "p3", assigned_user: "u1", created_at: "2024-03-05" },
  { id: "l4", title: "Sunset Blvd Listing Lead", stage: "contacted", priority: "Low", source: "Cold Call", estimated_value: 110000, next_follow_up: "2024-04-15", tags: ["Listing"], contact_id: "c4", property_id: "p4", assigned_user: "u3", created_at: "2024-03-12" },
  { id: "l5", title: "Manor Rd Multi-Family", stage: "closed", priority: "Medium", source: "Website", estimated_value: 80000, next_follow_up: null, tags: ["Multi-Family", "Closed"], contact_id: "c6", property_id: "p5", assigned_user: "u2", created_at: "2024-01-15" },
  { id: "l6", title: "Pre-Foreclosure Lead - Chen", stage: "new", priority: "Urgent", source: "Driving for Dollars", estimated_value: 35000, next_follow_up: "2024-04-09", tags: ["Pre-Foreclosure", "Urgent"], contact_id: "c6", property_id: null, assigned_user: "u4", created_at: "2024-03-15" },
  { id: "l7", title: "Buyer Lead - Robert J.", stage: "new", priority: "Medium", source: "Facebook Ads", estimated_value: 0, next_follow_up: "2024-04-11", tags: ["Buyer"], contact_id: "c4", property_id: null, assigned_user: "u3", created_at: "2024-03-18" },
  { id: "l8", title: "Industrial Property Inquiry", stage: "dead", priority: "Low", source: "Website", estimated_value: 0, next_follow_up: null, tags: ["Commercial"], contact_id: "c7", property_id: "p6", assigned_user: "u1", created_at: "2024-02-01" },
];

export const tasks: Task[] = [
  { id: "t1", title: "Call Maria Santos - follow up on offer", description: "Discuss counter-offer terms for Oak Ridge property", completed: false, due_date: "2024-04-08", priority: "High", assigned_user: "u1", linked_entity: { type: "lead", id: "l1", name: "Oak Ridge Wholesale Deal" }, created_at: "2024-04-01" },
  { id: "t2", title: "Schedule property tour - Elm Street", description: "Coordinate with Linda Park for property walkthrough", completed: false, due_date: "2024-04-09", priority: "Medium", assigned_user: "u2", linked_entity: { type: "lead", id: "l2", name: "Elm Street Flip Opportunity" }, created_at: "2024-04-02" },
  { id: "t3", title: "Send comps to James Whitfield", description: "Pull comparable sales for Congress Ave area", completed: true, due_date: "2024-04-07", priority: "Low", assigned_user: "u1", linked_entity: { type: "contact", id: "c2", name: "James Whitfield" }, created_at: "2024-04-01" },
  { id: "t4", title: "Submit offer - Congress Ave Condo", description: "Prepare and submit assignment contract", completed: false, due_date: "2024-04-08", priority: "High", assigned_user: "u1", linked_entity: { type: "lead", id: "l3", name: "Congress Ave Condo Assignment" }, created_at: "2024-04-03" },
  { id: "t5", title: "Research pre-foreclosure timeline", description: "Check county records for Chen property foreclosure status", completed: false, due_date: "2024-04-10", priority: "High", assigned_user: "u4", linked_entity: { type: "lead", id: "l6", name: "Pre-Foreclosure Lead - Chen" }, created_at: "2024-04-05" },
  { id: "t6", title: "Update CRM with new buyer criteria", description: "Robert wants 4+ beds, under $500k, Austin area", completed: false, due_date: "2024-04-12", priority: "Low", assigned_user: "u3", linked_entity: { type: "contact", id: "c4", name: "Robert Johnson" }, created_at: "2024-04-06" },
  { id: "t7", title: "Order title search - Oak Ridge", description: "Contact Patricia at title company", completed: false, due_date: "2024-04-07", priority: "High", assigned_user: "u1", linked_entity: { type: "property", id: "p1", name: "4521 Oak Ridge Dr" }, created_at: "2024-03-28" },
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
];

export const activities: ActivityItem[] = [
  { id: "a1", action: "moved lead to Under Contract", user: "Alex Rivera", entity: "Oak Ridge Wholesale Deal", entity_type: "lead", timestamp: "2024-04-07T16:30:00" },
  { id: "a2", action: "added a note", user: "Jordan Kim", entity: "Elm Street Flip Opportunity", entity_type: "lead", timestamp: "2024-04-07T14:15:00" },
  { id: "a3", action: "created new lead", user: "Taylor Brooks", entity: "Pre-Foreclosure Lead - Chen", entity_type: "lead", timestamp: "2024-04-07T11:00:00" },
  { id: "a4", action: "completed task", user: "Alex Rivera", entity: "Send comps to James Whitfield", entity_type: "task", timestamp: "2024-04-07T09:45:00" },
  { id: "a5", action: "uploaded document", user: "Alex Rivera", entity: "Purchase_Agreement_OakRidge.pdf", entity_type: "lead", timestamp: "2024-04-06T15:20:00" },
  { id: "a6", action: "scheduled meeting", user: "Sam Chen", entity: "Buyer Consultation - Robert", entity_type: "contact", timestamp: "2024-04-06T13:00:00" },
  { id: "a7", action: "updated property details", user: "Jordan Kim", entity: "912 Elm Street", entity_type: "property", timestamp: "2024-04-06T10:30:00" },
  { id: "a8", action: "changed lead priority to Urgent", user: "Taylor Brooks", entity: "Pre-Foreclosure Lead - Chen", entity_type: "lead", timestamp: "2024-04-05T17:00:00" },
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

export function getStageLabel(stageId: StageId) {
  return PIPELINE_STAGES.find(s => s.id === stageId)?.label ?? stageId;
}
