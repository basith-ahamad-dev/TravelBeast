/**
 * Locations for the interactive Sri Lanka map (see components/public/SriLankaMap.tsx).
 *
 * - `top` / `left` are percentages of the map image, so pins stay on their landmark at any screen size.
 *   Adjust them by hand if a pin needs nudging.
 * - `href` is where the card's button goes. Point each one at its own page/package when you have them.
 * - `image` is a real photo for the card. Drop a landscape JPG (about 800x400 or larger) in public/images/places/ and
 *   set e.g. image: "/images/places/sigiriya.jpg". Without it the card shows a crop of the map artwork.
 * - `thumb` picks which part of the map artwork is cropped into the card photo (x/y = centre in %, w = width in %).
 *  
 * - `rating` / `reviews` are PLACEHOLDERS: replace them with real figures, or delete them to hide the badge.
 */
export type MapLocation = {
  id: string;
  name: string;
  description: string;
  top: number;
  left: number;
  href: string;
  rating?: number;
  reviews?: number;
  image?: string;
  /** Real-world position, used for the card's "View on Google Maps" link. */
  lat?: number;
  lng?: number;
  thumb?: { x: number; y: number; w?: number };
};

const SL = "/destinations/sri-lanka";

export const mapImage = { src: "/images/sri-lanka-map.jpg", width: 2752, height: 1536, alt: "Illustrated tourist map of Sri Lanka" };

const baseLocations: MapLocation[] = [
  {
    id: "jaffna",
    name: "Jaffna",
    description: "The cultural capital of the north: a Dutch-era fort, vibrant Hindu temples and unique Tamil cuisine.",
    top: 8, left: 36, href: SL, rating: 4.7, reviews: 86,
    thumb: { x: 37, y: 7, w: 20 },
  },
  {
    id: "anuradhapura",
    name: "Ruwanweli Maha Seya, Anuradhapura",
    description: "A gleaming white stupa and the heart of Sri Lanka's oldest sacred city, over 2,000 years old.",
    top: 16, left: 45.8, href: SL, rating: 4.8, reviews: 142,
    thumb: { x: 45.8, y: 17, w: 20 },
  },
  {
    id: "sigiriya",
    name: "Sigiriya (The Lion Rock)",
    description: "Climb the ancient rock fortress, past frescoes and the Lion's Paws, for sweeping views of the jungle.",
    top: 30, left: 50, href: SL, rating: 4.9, reviews: 318,
    thumb: { x: 50.5, y: 31, w: 20 },
  },
  {
    id: "polonnaruwa",
    name: "Polonnaruwa",
    description: "Wander the ruins of a medieval royal capital: palaces, stone Buddhas and ancient temples.",
    top: 36, left: 62, href: SL, rating: 4.7, reviews: 97,
    thumb: { x: 63.7, y: 35.5, w: 20 },
  },
  {
    id: "kandy",
    name: "Temple of the Tooth, Kandy",
    description: "Sri Lanka's most sacred Buddhist temple, beside Kandy Lake in the hill-country capital.",
    top: 44.5, left: 51.6, href: SL, rating: 4.8, reviews: 264,
    thumb: { x: 51.6, y: 45, w: 20 },
  },
  {
    id: "lotus-tower",
    name: "Colombo Lotus Tower",
    description: "South Asia's tallest tower, with a lotus-bud top and panoramic views over the capital.",
    top: 43.5, left: 40.2, href: SL, rating: 4.6, reviews: 119,
    thumb: { x: 40.2, y: 47, w: 16 },
  },
  {
    id: "colombo",
    name: "Colombo",
    description: "A lively coastal capital of colonial buildings, street food, shopping and sunset promenades.",
    top: 55, left: 33, href: SL, rating: 4.5, reviews: 203,
    thumb: { x: 33, y: 56, w: 18 },
  },
  {
    id: "nuwara-eliya",
    name: "Nuwara Eliya",
    description: "Misty tea plantations, cool air and colonial charm: the \"Little England\" of the hill country.",
    top: 62, left: 48.5, href: SL, rating: 4.8, reviews: 175,
    thumb: { x: 48.5, y: 62, w: 20 },
  },
  {
    id: "ella",
    name: "Nine Arch Bridge, Ella",
    description: "Watch the blue train cross this iconic stone viaduct, surrounded by green hills and tea.",
    top: 59.8, left: 64, href: SL, rating: 4.9, reviews: 291,
    thumb: { x: 64, y: 59, w: 20 },
  },
  {
    id: "yala",
    name: "Yala",
    description: "Safari through Sri Lanka's best-known national park for leopards, elephants and wild peacocks.",
    top: 69.5, left: 76.3, href: SL, rating: 4.8, reviews: 226,
    thumb: { x: 76, y: 66, w: 20 },
  },
  {
    id: "galle",
    name: "Galle",
    description: "A UNESCO-listed Dutch fort above the ocean, with a lighthouse, boutiques and cafés.",
    top: 80, left: 30, href: SL, rating: 4.8, reviews: 188,
    thumb: { x: 26, y: 82, w: 20 },
  },
  {
    id: "mirissa",
    name: "Mirissa (Coconut Tree Hill)",
    description: "Golden beaches, surf breaks and whale watching, plus the famous Coconut Tree Hill.",
    top: 85, left: 58, href: SL, rating: 4.7, reviews: 154,
    thumb: { x: 58, y: 85, w: 20 },
  },
];

/** Real coordinates of each landmark (lat, lng). */
const coords: Record<string, [number, number]> = {
  jaffna: [9.6728, 80.009],
  anuradhapura: [8.3503, 80.3969],
  sigiriya: [7.957, 80.7603],
  polonnaruwa: [7.9403, 81.0188],
  kandy: [7.2936, 80.6413],
  "lotus-tower": [6.9272, 79.8586],
  colombo: [6.9344, 79.8428],
  "nuwara-eliya": [6.9497, 80.7891],
  ella: [6.8764, 81.0608],
  yala: [6.3728, 81.5167],
  galle: [6.0267, 80.217],
  mirissa: [5.9437, 80.4604],
};

/** Photos in public/images/places/ (resized from public/Tourist_Places). */
const photos: Record<string, string> = {
  jaffna: "/images/places/jaffna.jpg",
  anuradhapura: "/images/places/anuradhapura.jpg",
  sigiriya: "/images/places/sigiriya.jpg",
  polonnaruwa: "/images/places/polonnaruwa.jpg",
  kandy: "/images/places/kandy.jpg",
  "lotus-tower": "/images/places/lotus-tower.jpg",
  colombo: "/images/places/colombo.jpg",
  "nuwara-eliya": "/images/places/nuwara-eliya.jpg",
  ella: "/images/places/ella.jpg",
  yala: "/images/places/yala.jpg",
  galle: "/images/places/galle.jpg",
  mirissa: "/images/places/mirissa.jpg",
};

export const mapLocations: MapLocation[] = baseLocations.map((l) => ({
  ...l,
  image: l.image ?? photos[l.id],
  lat: coords[l.id]?.[0],
  lng: coords[l.id]?.[1],
}));

export function googleMapsUrl(l: MapLocation) {
  const q = l.lat != null && l.lng != null ? `${l.lat},${l.lng}` : encodeURIComponent(`${l.name}, Sri Lanka`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}
