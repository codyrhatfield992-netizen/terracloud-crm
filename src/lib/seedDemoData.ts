// ─────────────────────────────────────────────────────────────
// TerraCloud XR — Demo data seeder
// On first login (or when tables are empty), populates the
// account with a believable book of clients, listings, contacts,
// tasks, meetings, and documents so the platform looks alive.
// ─────────────────────────────────────────────────────────────

import { supabase } from "@/integrations/supabase/client";

const SEED_FLAG_KEY = "tcxr_demo_seeded_v1";

const DEMO_PROPERTIES = [
  {
    address: "27 Lakeshore Estate Way",
    city: "Westlake", state: "TX", zip: "78746",
    property_type: "Single Family", beds: 6, baths: 7, sqft: 8400,
    asking_price: 4_850_000, arv: 5_200_000, offer_price: 0,
    status: "available",
    notes: "Marquee estate · private lake frontage · Wolf/Sub-Zero · wine cellar.",
    image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    address: "4218 Sunset Ridge Dr",
    city: "Austin", state: "TX", zip: "78735",
    property_type: "Single Family", beds: 5, baths: 4, sqft: 4250,
    asking_price: 1_895_000, arv: 2_100_000, offer_price: 0,
    status: "available",
    notes: "Hill-country views · saltwater pool · 3-car garage · smart-home wired.",
    image_url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
  },
  {
    address: "812 Heritage Oaks Ln",
    city: "Plano", state: "TX", zip: "75024",
    property_type: "Single Family", beds: 4, baths: 3, sqft: 3180,
    asking_price: 825_000, arv: 880_000, offer_price: 815_000,
    status: "under_contract",
    notes: "Top-rated school zone · open-concept kitchen · fenced backyard.",
    image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    address: "55 Ironwood Loft #12B",
    city: "Austin", state: "TX", zip: "78701",
    property_type: "Condo", beds: 2, baths: 2, sqft: 1640,
    asking_price: 1_120_000, arv: 1_180_000, offer_price: 0,
    status: "available",
    notes: "Penthouse loft · floor-to-ceiling windows · concierge building.",
    image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
  },
  {
    address: "9 Crestview Estate Dr",
    city: "Dallas", state: "TX", zip: "75230",
    property_type: "Single Family", beds: 5, baths: 6, sqft: 6100,
    asking_price: 3_250_000, arv: 3_500_000, offer_price: 0,
    status: "available",
    notes: "Hilltop architectural · home theater · resort-style backyard.",
    image_url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
  },
  {
    address: "1402 Maple Ct",
    city: "Round Rock", state: "TX", zip: "78664",
    property_type: "Single Family", beds: 3, baths: 2, sqft: 2010,
    asking_price: 495_000, arv: 530_000, offer_price: 488_000,
    status: "sold",
    notes: "First-time buyer perfect · turnkey · low-maintenance yard.",
    image_url: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
  },
  {
    address: "318 Magnolia Park Ave",
    city: "Houston", state: "TX", zip: "77019",
    property_type: "Single Family", beds: 5, baths: 5, sqft: 5400,
    asking_price: 2_795_000, arv: 2_950_000, offer_price: 0,
    status: "available",
    notes: "River Oaks-adjacent · chef's kitchen · guest casita · pool.",
    image_url: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80",
  },
  {
    address: "44 Westbrook Mews",
    city: "Austin", state: "TX", zip: "78704",
    property_type: "Townhouse", beds: 3, baths: 2, sqft: 1820,
    asking_price: 685_000, arv: 720_000, offer_price: 0,
    status: "available",
    notes: "Walkable South Congress · rooftop deck · 2-car garage.",
    image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
  },
  {
    address: "12 Pinehurst Villa Ct",
    city: "Frisco", state: "TX", zip: "75034",
    property_type: "Single Family", beds: 4, baths: 4, sqft: 3960,
    asking_price: 1_295_000, arv: 1_380_000, offer_price: 0,
    status: "available",
    notes: "New build · spec sheet ready · solar + EV charger.",
    image_url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1200&q=80",
  },
  {
    address: "67 Cedar Knoll Pl",
    city: "Round Rock", state: "TX", zip: "78665",
    property_type: "Single Family", beds: 4, baths: 3, sqft: 2820,
    asking_price: 612_000, arv: 660_000, offer_price: 605_000,
    status: "under_contract",
    notes: "Family layout · cul-de-sac · pre-empted safety questions in tour.",
    image_url: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1200&q=80",
  },
  {
    address: "880 Riverbend Estate Dr",
    city: "Austin", state: "TX", zip: "78732",
    property_type: "Single Family", beds: 5, baths: 5, sqft: 5200,
    asking_price: 2_450_000, arv: 2_600_000, offer_price: 0,
    status: "available",
    notes: "Waterfront · boat dock · investment-grade · short-term rental potential.",
    image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    address: "2201 Brookfield Cottage Rd",
    city: "Cedar Park", state: "TX", zip: "78613",
    property_type: "Single Family", beds: 3, baths: 2, sqft: 1740,
    asking_price: 425_000, arv: 460_000, offer_price: 0,
    status: "available",
    notes: "Investor flip candidate · cosmetic only · strong rental comps.",
    image_url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
  },
];

const DEMO_CONTACTS = [
  { name: "Marcus Chen", email: "marcus.chen@chenholdings.com", phone: "+1 (512) 555-0142", type: "buyer", source: "Referral", tags: ["investor", "skeptical", "high-net-worth"] },
  { name: "Eleanor Vance", email: "eleanor@vancegroup.com", phone: "+1 (214) 555-0188", type: "buyer", source: "Networking", tags: ["luxury", "concierge"] },
  { name: "Priya Shah", email: "priya.shah@gmail.com", phone: "+1 (469) 555-0211", type: "buyer", source: "Website", tags: ["family", "schools-priority"] },
  { name: "Daniel Shah", email: "daniel.shah@gmail.com", phone: "+1 (469) 555-0212", type: "buyer", source: "Website", tags: ["family"] },
  { name: "Jamie Carter", email: "jamie.carter@outlook.com", phone: "+1 (737) 555-0334", type: "buyer", source: "Zillow", tags: ["first-time", "nervous"] },
  { name: "Robin Carter", email: "robin.carter@outlook.com", phone: "+1 (737) 555-0335", type: "buyer", source: "Zillow", tags: ["first-time"] },
  { name: "Dr. Aiden Park", email: "aiden.park@parkmd.com", phone: "+1 (512) 555-0466", type: "buyer", source: "Referral", tags: ["analytical", "spec-driven"] },
  { name: "Victor Halloway", email: "v.halloway@halloway-cap.com", phone: "+1 (214) 555-0501", type: "buyer", source: "Cold Call", tags: ["ego-driven", "luxury"] },
  { name: "Helena Kowalski", email: "helena.k@kowalski-re.com", phone: "+1 (512) 555-0612", type: "buyer", source: "Networking", tags: ["investor", "skeptical"] },
  { name: "Theo Marchetti", email: "theo@marchetti.global", phone: "+1 (713) 555-0744", type: "buyer", source: "Referral", tags: ["luxury", "international"] },
  { name: "Lina Okafor", email: "lina.okafor@gmail.com", phone: "+1 (737) 555-0855", type: "buyer", source: "Facebook Ads", tags: ["first-time"] },
  { name: "Reza Tahiri", email: "reza.tahiri@tahiri-eng.com", phone: "+1 (214) 555-0966", type: "buyer", source: "Google Ads", tags: ["analytical"] },
  { name: "Naomi Rivers", email: "naomi.rivers@gmail.com", phone: "+1 (512) 555-1077", type: "buyer", source: "Website", tags: ["family"] },
  { name: "Sandra Whitlock", email: "sandra@whitlock-listings.com", phone: "+1 (214) 555-1188", type: "seller", source: "Networking", tags: ["luxury-seller"] },
  { name: "James Bellamy", email: "james@bellamy-realty.com", phone: "+1 (512) 555-1299", type: "agent", source: "Referral", tags: ["co-listing"] },
];

const LEAD_TEMPLATES = [
  { contactName: "Marcus Chen", title: "Marcus Chen — Skeptical Investor Track", stage: "tour", priority: "high", source: "Referral", value: 1_895_000, propertyHint: "Sunset Ridge", tags: ["investor", "rehearse"] },
  { contactName: "Eleanor Vance", title: "Eleanor Vance — Lakeshore Estate", stage: "offer", priority: "urgent", source: "Networking", value: 4_850_000, propertyHint: "Lakeshore", tags: ["luxury"] },
  { contactName: "Priya Shah", title: "Shah Family — Heritage Oaks", stage: "contract", priority: "high", source: "Website", value: 825_000, propertyHint: "Heritage Oaks", tags: ["family"] },
  { contactName: "Jamie Carter", title: "Carter Couple — First Home Search", stage: "contacted", priority: "medium", source: "Zillow", value: 495_000, propertyHint: "Maple Ct", tags: ["first-time"] },
  { contactName: "Dr. Aiden Park", title: "Dr. Park — Ironwood Loft Pursuit", stage: "tour", priority: "high", source: "Referral", value: 1_120_000, propertyHint: "Ironwood Loft", tags: ["analytical"] },
  { contactName: "Victor Halloway", title: "Halloway — Crestview Estate", stage: "dead", priority: "low", source: "Cold Call", value: 3_250_000, propertyHint: "Crestview", tags: ["ego-driven", "post-mortem"] },
  { contactName: "Helena Kowalski", title: "Kowalski — Brookfield Investment", stage: "new", priority: "medium", source: "Networking", value: 425_000, propertyHint: "Brookfield", tags: ["investor"] },
  { contactName: "Theo Marchetti", title: "Marchetti — Magnolia Park", stage: "tour", priority: "urgent", source: "Referral", value: 2_795_000, propertyHint: "Magnolia Park", tags: ["luxury", "international"] },
  { contactName: "Lina Okafor", title: "Okafor — Westbrook Townhome", stage: "contacted", priority: "medium", source: "Facebook Ads", value: 685_000, propertyHint: "Westbrook", tags: ["first-time"] },
  { contactName: "Reza Tahiri", title: "Tahiri — Pinehurst Villa", stage: "dead", priority: "low", source: "Google Ads", value: 1_295_000, propertyHint: "Pinehurst", tags: ["analytical", "lost"] },
  { contactName: "Naomi Rivers", title: "Rivers Family — Cedar Knoll", stage: "closed", priority: "medium", source: "Website", value: 612_000, propertyHint: "Cedar Knoll", tags: ["family", "won"] },
  { contactName: "Marcus Chen", title: "Marcus Chen — Riverbend Investment Track", stage: "offer", priority: "high", source: "Referral", value: 2_450_000, propertyHint: "Riverbend", tags: ["investor"] },
];

const DEMO_TASKS = [
  { title: "Prep spec sheet for Dr. Park (HVAC, R-value, foundation)", priority: "urgent", days: 0 },
  { title: "Re-rehearse Crestview opening — slow pacing 30%", priority: "high", days: 1 },
  { title: "Send wine-cellar provenance docs to Eleanor Vance", priority: "high", days: 1 },
  { title: "Confirm Saturday tour · Sunset Ridge · Marcus Chen", priority: "high", days: 2 },
  { title: "Pre-load 3 exclusivity hooks for Magnolia Park sim", priority: "medium", days: 2 },
  { title: "Schedule HOA reframing call with Lina Okafor", priority: "medium", days: 3 },
  { title: "Draft offer counter for Heritage Oaks · Shah family", priority: "urgent", days: 0 },
  { title: "Order updated comp set for Riverbend Estate", priority: "medium", days: 4 },
  { title: "Run trust-recovery simulation with Halloway archetype", priority: "low", days: 5 },
  { title: "Brief co-listing agent (Bellamy) on Lakeshore showing", priority: "high", days: 1 },
  { title: "Update digital twin scan for 880 Riverbend", priority: "medium", days: 6 },
  { title: "Quarterly archetype performance review", priority: "low", days: 7 },
];

const DEMO_MEETINGS = [
  { title: "Sunset Ridge tour · Marcus Chen", days: 1, time: "10:00", duration: "60", location: "4218 Sunset Ridge Dr, Austin TX", notes: "Pre-load investor objection set. Trust meter calibrated to 64." },
  { title: "Lakeshore Estate concierge walkthrough · Eleanor Vance", days: 2, time: "14:00", duration: "90", location: "27 Lakeshore Estate Way, Westlake TX", notes: "Story-led, every room. No specs unless asked." },
  { title: "Offer review · Shah family · Heritage Oaks", days: 0, time: "16:30", duration: "45", location: "Zoom", notes: "Walk through counter terms. Address school-bus route question." },
  { title: "Discovery call · Helena Kowalski", days: 3, time: "11:15", duration: "30", location: "Phone", notes: "Investor profile intake; identify yield thresholds." },
  { title: "Magnolia Park rehearsal · Theo Marchetti", days: 4, time: "09:30", duration: "75", location: "VR Studio · Suite 4", notes: "International buyer; concierge framing." },
  { title: "Post-mortem review · Halloway autopsy", days: 1, time: "15:00", duration: "45", location: "Internal", notes: "Walk team through trust-collapse pattern." },
];

const DEMO_DOCUMENTS = [
  { name: "Lakeshore_Estate_Spec_Sheet.pdf", file_type: "pdf", size: 2_450_000, entity_type: "property" },
  { name: "Sunset_Ridge_Comp_Set.xlsx", file_type: "xlsx", size: 184_000, entity_type: "property" },
  { name: "Heritage_Oaks_Counter_Offer.pdf", file_type: "pdf", size: 92_000, entity_type: "lead" },
  { name: "Crestview_Autopsy_Report.pdf", file_type: "pdf", size: 1_120_000, entity_type: "simulation" },
  { name: "Marcus_Chen_Investor_Profile.pdf", file_type: "pdf", size: 340_000, entity_type: "contact" },
  { name: "Magnolia_Park_3D_Twin_Scan.usdz", file_type: "usdz", size: 48_200_000, entity_type: "property" },
  { name: "Pinehurst_Villa_HVAC_Specs.pdf", file_type: "pdf", size: 612_000, entity_type: "property" },
  { name: "Q3_Archetype_Performance.pdf", file_type: "pdf", size: 880_000, entity_type: "report" },
];

const DEMO_ACTIVITIES = [
  { type: "call", description: "Discovery call with Marcus Chen — 18 min · investor archetype confirmed", entity_type: "contact" },
  { type: "email", description: "Sent comp set + tax projection to Shah family", entity_type: "lead" },
  { type: "meeting", description: "In-person tour at Lakeshore Estate · Eleanor Vance lingered in wine cellar", entity_type: "lead" },
  { type: "note", description: "Behavioral observation · Halloway interrupts when challenged — flag", entity_type: "contact" },
  { type: "sms", description: "Confirmed Saturday tour with Carter couple", entity_type: "lead" },
  { type: "simulation", description: "Heritage Oaks Reveal · Run 12 completed · score 91 · CLOSED", entity_type: "simulation" },
  { type: "simulation", description: "Crestview Estate · Run 04 · trust collapse at 8:42 · LOST", entity_type: "simulation" },
  { type: "note", description: "Pre-loaded objection deck for Dr. Park rehearsal", entity_type: "lead" },
];

export async function seedDemoDataIfEmpty(userId: string): Promise<{ seeded: boolean; reason: string }> {
  try {
    // Cheap client-side guard so we don't hit the DB on every reload
    if (typeof window !== "undefined") {
      const flagged = localStorage.getItem(`${SEED_FLAG_KEY}:${userId}`);
      if (flagged) return { seeded: false, reason: "already-flagged" };
    }

    // Check if user already has any leads or properties
    const [{ count: leadCount }, { count: propCount }] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("properties").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ]);

    if ((leadCount ?? 0) > 0 || (propCount ?? 0) > 0) {
      if (typeof window !== "undefined") localStorage.setItem(`${SEED_FLAG_KEY}:${userId}`, "1");
      return { seeded: false, reason: "data-exists" };
    }

    // 1. Properties
    const propertyRows = DEMO_PROPERTIES.map(p => ({ ...p, user_id: userId }));
    const { data: insertedProps, error: propErr } = await supabase
      .from("properties").insert(propertyRows as any).select("id, address");
    if (propErr) throw propErr;

    // 2. Contacts
    const contactRows = DEMO_CONTACTS.map(c => ({ ...c, user_id: userId }));
    const { data: insertedContacts, error: contactErr } = await supabase
      .from("contacts").insert(contactRows as any).select("id, name");
    if (contactErr) throw contactErr;

    // 3. Leads (link contact + property)
    const findContact = (name: string) => insertedContacts?.find(c => c.name === name)?.id ?? null;
    const findProperty = (hint: string) => insertedProps?.find(p => p.address.toLowerCase().includes(hint.toLowerCase()))?.id ?? null;
    const now = Date.now();
    const leadRows = LEAD_TEMPLATES.map((l, i) => ({
      user_id: userId,
      title: l.title,
      stage: l.stage,
      priority: l.priority,
      source: l.source,
      estimated_value: l.value,
      next_follow_up: new Date(now + (i + 1) * 86_400_000).toISOString().split("T")[0],
      tags: l.tags,
      contact_id: findContact(l.contactName),
      property_id: findProperty(l.propertyHint),
    }));
    const { error: leadErr } = await supabase.from("leads").insert(leadRows as any);
    if (leadErr) throw leadErr;

    // 4. Tasks
    const taskRows = DEMO_TASKS.map(t => ({
      user_id: userId,
      title: t.title,
      description: "",
      completed: false,
      priority: t.priority,
      due_date: new Date(now + t.days * 86_400_000).toISOString().split("T")[0],
      related_entity_type: "lead",
      related_entity_id: null,
    }));
    await supabase.from("tasks").insert(taskRows as any);

    // 5. Meetings
    const meetingRows = DEMO_MEETINGS.map(m => ({
      user_id: userId,
      title: m.title,
      date: new Date(now + m.days * 86_400_000).toISOString().split("T")[0],
      time: m.time,
      duration: m.duration,
      location: m.location,
      notes: m.notes,
      attendees: [],
    }));
    await supabase.from("meetings").insert(meetingRows as any);

    // 6. Documents
    const docRows = DEMO_DOCUMENTS.map(d => ({
      user_id: userId,
      name: d.name,
      file_type: d.file_type,
      size: d.size,
      entity_type: d.entity_type,
      entity_id: null,
      url: "",
    }));
    await supabase.from("documents").insert(docRows as any);

    // 7. Activities
    const activityRows = DEMO_ACTIVITIES.map((a, i) => ({
      user_id: userId,
      type: a.type,
      description: a.description,
      entity_type: a.entity_type,
      entity_id: null,
      created_at: new Date(now - (i + 1) * 3_600_000).toISOString(),
    }));
    await supabase.from("activities").insert(activityRows as any);

    if (typeof window !== "undefined") localStorage.setItem(`${SEED_FLAG_KEY}:${userId}`, "1");
    return { seeded: true, reason: "ok" };
  } catch (e) {
    console.error("[seedDemoData] failed:", e);
    return { seeded: false, reason: "error" };
  }
}
