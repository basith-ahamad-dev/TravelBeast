import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const db = new PrismaClient({
  adapter: new PrismaLibSQL({
    url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:./dev.db",
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  }),
});
const u = (id: string, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const destinations = [
  {
    name: "Bali", slug: "bali", country: "Indonesia", featured: true, sortOrder: 1,
    shortDescription: "Rice terraces, temples and surf-fringed beaches on the Island of the Gods.",
    description: "Bali blends lush jungle, volcanic scenery, ancient temples and some of Asia's friendliest beaches. Wander the rice terraces of Ubud, watch the sunset at a clifftop temple, or learn to surf at Canggu.",
    cover: u("1537996194471-e657df975ab4"),
  },
  {
    name: "Maldives", slug: "maldives", country: "Maldives", featured: true, sortOrder: 2,
    shortDescription: "Turquoise lagoons, overwater villas and world-class snorkelling.",
    description: "Made up of more than a thousand coral islands, the Maldives is a haven of white sand, crystal water and vibrant reefs, perfect for honeymoons and slow, restorative escapes.",
    cover: u("1573790387438-4da905039392"),
  },
  {
    name: "Sri Lanka", slug: "sri-lanka", country: "Sri Lanka", featured: true, sortOrder: 3,
    shortDescription: "Tea country, wild safaris, golden beaches and ancient cities.",
    description: "A compact island packed with variety: misty tea plantations, elephant gatherings, ancient rock fortresses, whale watching and a warm, welcoming culture.",
    cover: u("1586500036706-41963de24d8b"),
  },
  {
    name: "Phuket", slug: "phuket", country: "Thailand", featured: true, sortOrder: 4,
    shortDescription: "Island hopping, limestone cliffs and legendary Thai hospitality.",
    description: "Thailand's largest island is the gateway to the Andaman Sea: boat trips to Phi Phi and Phang Nga Bay, buzzing night markets and beaches for every mood.",
    cover: u("1507525428034-b723cf961d3e"),
  },
];

type Pkg = {
  title: string; slug: string; dest: string; days: number; nights: number; price: number;
  short: string; desc: string; cover: string; gallery: string[]; featured: boolean;
  included: string[]; excluded: string[]; itinerary: [string, string][]; info: string;
};

const commonExcluded = ["International flights", "Travel insurance", "Personal expenses", "Visa fees"];
const info = "Passports must be valid for at least 6 months. Itineraries may be adjusted for weather or local conditions. Prices are per person based on twin sharing and vary by season.";

const packages: Pkg[] = [
  {
    title: "Bali Escape: Culture & Coast", slug: "bali-escape-culture-coast", dest: "bali", days: 7, nights: 6, price: 899, featured: true,
    short: "Temples, rice terraces and beach sunsets across Ubud, Uluwatu and Seminyak.",
    desc: "A balanced week that mixes Bali's spiritual heartland with its glittering coastline. Stay in boutique hotels, enjoy a private driver, and explore at an easy pace with time to swim, spa and savour local food.",
    cover: u("1537996194471-e657df975ab4"), gallery: [u("1518548419970-58e3b4079ab2"), u("1507525428034-b723cf961d3e"), u("1540541338287-41700207dee6")],
    included: ["6 nights boutique accommodation", "Daily breakfast", "Airport transfers", "Private driver for tours", "Ubud rice terrace & temple tour", "Sunset at Uluwatu temple"],
    excluded: commonExcluded,
    itinerary: [
      ["Arrival in Bali", "Meet your driver at Denpasar airport and transfer to your Ubud hotel. Evening at leisure."],
      ["Ubud Culture", "Visit the Tegallalang rice terraces, a holy spring temple and the Ubud art market."],
      ["Waterfalls & Spa", "Morning waterfall trek followed by a relaxing traditional Balinese massage."],
      ["Transfer to Uluwatu", "Scenic drive south and free afternoon on the beach."],
      ["Uluwatu Sunset", "Cliff-top temple visit with a sunset Kecak fire dance performance."],
      ["Seminyak Leisure", "Beach club day, boutique shopping and a farewell seafood dinner."],
      ["Departure", "Breakfast and transfer to the airport."],
    ],
    info,
  },
  {
    title: "Maldives Overwater Dream", slug: "maldives-overwater-dream", dest: "maldives", days: 5, nights: 4, price: 1890, featured: true,
    short: "Four nights in an overwater villa with snorkelling and sunset cruises.",
    desc: "The ultimate island getaway. Wake above the lagoon, snorkel the house reef, and enjoy a sunset dolphin cruise, all with seaplane transfers included.",
    cover: u("1573790387438-4da905039392"), gallery: [u("1559827260-dc66d52bef19"), u("1506929562872-bb421503ef21")],
    included: ["4 nights overwater villa", "Half-board meals", "Return seaplane transfers", "Sunset dolphin cruise", "Snorkelling equipment"],
    excluded: [...commonExcluded, "Alcoholic drinks", "Spa treatments"],
    itinerary: [
      ["Arrive & Seaplane", "Land in Malé and take a scenic seaplane to your resort."],
      ["Lagoon Life", "Snorkel the house reef and relax on the sandbank."],
      ["Sunset Cruise", "Evening dolphin-spotting cruise with refreshments."],
      ["Free Day", "Optional diving, paddle-boarding or spa."],
      ["Departure", "Seaplane back to Malé for your flight home."],
    ],
    info,
  },
  {
    title: "Sri Lanka Grand Discovery", slug: "sri-lanka-grand-discovery", dest: "sri-lanka", days: 10, nights: 9, price: 1250, featured: true,
    short: "Elephants, tea country, ancient cities and southern beaches in ten days.",
    desc: "A complete journey through the pearl of the Indian Ocean: Sigiriya rock fortress, a Yala safari, a scenic train through tea country and beach days in the south.",
    cover: u("1586500036706-41963de24d8b"), gallery: [u("1552465011-b4e21bf6e79a"), u("1469854523086-cc02fe5d8800")],
    included: ["9 nights hotels & lodges", "Daily breakfast", "Private air-conditioned vehicle & guide", "Yala safari jeep", "Entrance fees to main sites"],
    excluded: commonExcluded,
    itinerary: [
      ["Colombo Arrival", "Airport pickup and transfer to a beach hotel in Negombo."],
      ["Sigiriya", "Drive to the Cultural Triangle and climb the Lion Rock fortress."],
      ["Polonnaruwa", "Cycle through the ruins of the ancient capital."],
      ["Kandy", "Temple of the Tooth and a cultural dance show."],
      ["Tea Country", "Scenic train ride to Nuwara Eliya and a tea factory visit."],
      ["Ella", "Little Adam's Peak hike and the Nine Arch Bridge."],
      ["Yala Safari", "Afternoon jeep safari in search of leopards and elephants."],
      ["Galle Fort", "Explore the UNESCO-listed colonial fort."],
      ["Beach Day", "Relax on the south coast."],
      ["Departure", "Transfer to Colombo airport."],
    ],
    info,
  },
  {
    title: "Phuket & Phi Phi Island Hopper", slug: "phuket-phi-phi-island-hopper", dest: "phuket", days: 6, nights: 5, price: 640, featured: true,
    short: "Speedboat island tours, Phang Nga Bay and relaxed beach evenings.",
    desc: "Classic Thailand at a great price: beachfront stays, a full-day Phi Phi speedboat tour, kayaking among limestone karsts and plenty of free time.",
    cover: u("1507525428034-b723cf961d3e"), gallery: [u("1506929562872-bb421503ef21"), u("1566073771259-6a8506099945")],
    included: ["5 nights beach hotel", "Daily breakfast", "Phi Phi speedboat tour with lunch", "Phang Nga Bay kayaking", "Airport transfers"],
    excluded: commonExcluded,
    itinerary: [
      ["Arrival", "Transfer to your Patong beach hotel."],
      ["Free Day", "Beach, spa or Old Town walk."],
      ["Phi Phi Islands", "Full-day speedboat tour with snorkelling at Maya Bay."],
      ["Phang Nga Bay", "Sea-kayak through sea caves and hongs."],
      ["Big Buddha & Market", "Panoramic viewpoints and the weekend night market."],
      ["Departure", "Transfer to Phuket airport."],
    ],
    info,
  },
  {
    title: "Bali Honeymoon Retreat", slug: "bali-honeymoon-retreat", dest: "bali", days: 8, nights: 7, price: 1490, featured: false,
    short: "Private pool villas, candle-lit dinners and couples' spa rituals.",
    desc: "Designed for two: secluded villas with private pools, flower baths, a sunrise volcano trek and a private sunset cruise.",
    cover: u("1518548419970-58e3b4079ab2"), gallery: [u("1540541338287-41700207dee6")],
    included: ["7 nights private pool villas", "Daily breakfast", "Couples' spa treatment", "Candle-lit beach dinner", "Private driver"],
    excluded: commonExcluded,
    itinerary: [
      ["Arrival & Welcome", "Flower welcome and villa check-in."],
      ["Ubud Discovery", "Rice terraces and a private cooking class."],
      ["Sunrise Trek", "Mount Batur sunrise hike with breakfast."],
      ["Spa Day", "Couples' massage and flower bath."],
      ["Coast Transfer", "Move to your beachfront villa."],
      ["Sunset Cruise", "Private catamaran cruise."],
      ["Leisure", "Free day."],
      ["Departure", "Airport transfer."],
    ],
    info,
  },
  {
    title: "Maldives Snorkel & Dive Week", slug: "maldives-snorkel-dive-week", dest: "maldives", days: 8, nights: 7, price: 1650, featured: false,
    short: "Reef-focused resort stay with guided snorkel safaris and optional diving.",
    desc: "A week for ocean lovers with manta ray and whale shark excursions in season, reef-side beach villas and guided marine biologist talks.",
    cover: u("1559827260-dc66d52bef19"), gallery: [u("1573790387438-4da905039392")],
    included: ["7 nights beach villa", "Full board", "Speedboat transfers", "3 guided snorkel safaris"],
    excluded: [...commonExcluded, "Diving courses"],
    itinerary: [
      ["Arrival", "Speedboat transfer to the island."],
      ["House Reef", "Introductory snorkel."],
      ["Snorkel Safari", "Guided reef safari."],
      ["Free Day", "Relax."],
      ["Manta Point", "Excursion to a manta cleaning station."],
      ["Sandbank Picnic", "Private picnic on a sandbank."],
      ["Free Day", "Optional dive."],
      ["Departure", "Transfer to airport."],
    ],
    info,
  },
  {
    title: "Sri Lanka Beach & Whales", slug: "sri-lanka-beach-whales", dest: "sri-lanka", days: 5, nights: 4, price: 520, featured: false,
    short: "Mirissa whale watching, Galle Fort and unhurried beach days.",
    desc: "A short south-coast escape with a morning whale-watching trip, a stroll through Galle Fort and surf-lessons on a golden beach.",
    cover: u("1552465011-b4e21bf6e79a"), gallery: [u("1586500036706-41963de24d8b")],
    included: ["4 nights beach hotel", "Daily breakfast", "Whale-watching boat trip", "Galle Fort guided walk"],
    excluded: commonExcluded,
    itinerary: [
      ["Arrival", "Transfer to Mirissa."],
      ["Whale Watching", "Early morning boat trip."],
      ["Galle Fort", "Guided walking tour."],
      ["Surf & Chill", "Surf lesson and beach."],
      ["Departure", "Airport transfer."],
    ],
    info,
  },
  {
    title: "Phuket Family Fun Break", slug: "phuket-family-fun-break", dest: "phuket", days: 5, nights: 4, price: 580, featured: false,
    short: "Kid-friendly resort, elephant sanctuary visit and aquarium day.",
    desc: "Easy, relaxed and family friendly with a resort with a kids' club, an ethical elephant sanctuary visit and a beach picnic.",
    cover: u("1566073771259-6a8506099945"), gallery: [u("1507525428034-b723cf961d3e")],
    included: ["4 nights family room", "Daily breakfast", "Elephant sanctuary visit", "Airport transfers"],
    excluded: commonExcluded,
    itinerary: [
      ["Arrival", "Check in and pool time."],
      ["Beach Day", "Beach picnic and games."],
      ["Elephant Sanctuary", "Feed and walk with rescued elephants."],
      ["Aquarium", "Phuket Aquarium and shopping."],
      ["Departure", "Airport transfer."],
    ],
    info,
  },
];

const reviews = [
  { customerName: "Sarah M.", location: "London, UK", rating: 5, text: "From the first message to the final transfer everything was effortless. Our Bali itinerary was perfectly paced and the driver was wonderful." },
  { customerName: "Rohan P.", location: "Mumbai, India", rating: 5, text: "The Maldives package was worth every penny. The team answered every question quickly and the villa was beyond what we hoped for." },
  { customerName: "Elena & Marco", location: "Milan, Italy", rating: 5, text: "Sri Lanka in ten days sounded impossible but TravelBeast made it relaxed and unforgettable. The safari was the highlight." },
  { customerName: "James T.", location: "Sydney, Australia", rating: 4, text: "Great value Phuket trip. The island tour was fantastic. Would book again for the family." },
  { customerName: "Aisha K.", location: "Dubai, UAE", rating: 5, text: "Friendly, professional and genuinely caring. They adjusted our plan when we asked and it all worked perfectly." },
];

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@travelbeast.local").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password || password.length < 10) throw new Error("Set SEED_ADMIN_PASSWORD (10+ chars) in .env");
  await db.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, name: "Administrator", role: "SUPER_ADMIN", passwordHash: await bcrypt.hash(password, 12) },
  });

  await db.websiteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      heroImageUrl: u("1507525428034-b723cf961d3e", 2200),
      aboutText:
        "TravelBeast Tourism designs carefully planned journeys for travellers who want to experience the world's most beautiful destinations without the stress. From first inquiry to final farewell, our team looks after the details so you can focus on the adventure.",
      mission: "To make remarkable travel simple, affordable and personal for everyone, by crafting well-planned experiences backed by honest, professional support.",
      vision: "To be the most trusted name in tropical and cultural travel, known for memorable destinations and happy travellers who come back again.",
      footerText: "Carefully planned travel experiences to unforgettable destinations.",
    },
  });

  const destIds: Record<string, string> = {};
  for (const d of destinations) {
    const { cover, ...rest } = d;
    const rec = await db.destination.upsert({
      where: { slug: d.slug },
      update: {},
      create: { ...rest, coverUrl: cover },
    });
    destIds[d.slug] = rec.id;
    const has = await db.galleryImage.count({ where: { destinationId: rec.id } });
    if (!has)
      await db.galleryImage.create({
        data: { title: `${d.name} landscape`, url: cover, destinationId: rec.id, featured: true },
      });
  }

  const pkgIds: string[] = [];
  for (const p of packages) {
    const exists = await db.package.findUnique({ where: { slug: p.slug } });
    if (exists) { pkgIds.push(exists.id); continue; }
    const rec = await db.package.create({
      data: {
        title: p.title, slug: p.slug, shortDescription: p.short, description: p.desc,
        durationDays: p.days, durationNights: p.nights, price: p.price, currency: "USD",
        coverUrl: p.cover, included: p.included, excluded: p.excluded, importantInfo: p.info,
        featured: p.featured, published: true, destinationId: destIds[p.dest],
        images: { create: p.gallery.map((url, i) => ({ url, sortOrder: i, alt: p.title })) },
        itinerary: { create: p.itinerary.map(([title, description], i) => ({ dayNumber: i + 1, title, description })) },
      },
    });
    pkgIds.push(rec.id);
  }

  if ((await db.review.count()) === 0) {
    for (const [i, r] of reviews.entries())
      await db.review.create({
        data: {
          ...r, published: true, packageId: pkgIds[i % pkgIds.length],
          images: i < 3 ? { create: [{ url: packages[i].gallery[0] }] } : undefined,
        },
      });
  }
  console.log(`Seed complete. Admin: ${email}`);
}

main().finally(() => db.$disconnect());
