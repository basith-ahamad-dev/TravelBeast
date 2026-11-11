import { z } from "zod";

const text = (max: number) => z.string().trim().max(max);
const required = (max: number, label = "This field") =>
  z.string().trim().min(1, `${label} is required`).max(max, `Maximum ${max} characters`);

const imageUrl = z
  .string()
  .max(1000)
  .refine((u) => /^https:\/\//.test(u) || /^\/media\/[A-Za-z0-9._-]+$/.test(u), "Invalid image URL");

export const imageRef = z.object({
  url: imageUrl,
  publicId: z.string().max(300).nullish(),
  width: z.number().int().positive().nullish(),
  height: z.number().int().positive().nullish(),
  bytes: z.number().int().positive().nullish(),
  alt: text(200).nullish(),
});
export type ImageRef = z.infer<typeof imageRef>;

const stringList = z.array(z.string().trim().min(1).max(200)).max(40);

export const packageSchema = z.object({
  title: required(120, "Title"),
  shortDescription: required(300, "Short description"),
  description: text(10000).default(""),
  durationDays: z.coerce.number().int().min(1, "Min 1 day").max(90),
  durationNights: z.coerce.number().int().min(0).max(90),
  price: z.coerce.number().int().min(0, "Price must be 0 or more").max(10_000_000),
  currency: z.string().length(3).default("USD"),
  destinationId: required(40, "Destination"),
  included: stringList.default([]),
  excluded: stringList.default([]),
  importantInfo: text(5000).default(""),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  cover: imageRef.nullish(),
  images: z.array(imageRef).max(30).default([]),
  itinerary: z
    .array(z.object({ title: required(150, "Day title"), description: required(3000, "Day description") }))
    .max(60)
    .default([]),
});
export type PackageInput = z.infer<typeof packageSchema>;

export const destinationSchema = z.object({
  name: required(100, "Name"),
  country: text(100).nullish(),
  shortDescription: required(300, "Short description"),
  description: text(10000).default(""),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
  cover: imageRef.nullish(),
});

export const reviewSchema = z.object({
  customerName: required(100, "Customer name"),
  location: text(100).nullish(),
  rating: z.coerce.number().int().min(1).max(5),
  text: required(2000, "Review text"),
  published: z.boolean().default(true),
  packageId: z.string().max(40).nullish(),
  avatar: imageRef.nullish(),
  images: z.array(imageRef).max(10).default([]),
});

export const inquirySchema = z.object({
  name: required(100, "Name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(200),
  phone: text(40)
    .refine((v) => v === "" || /^[+()\-\s\d.]{6,40}$/.test(v), "Enter a valid phone number")
    .nullish(),
  message: required(3000, "Message"),
  packageId: z.string().max(40).nullish(),
  website: z.string().max(0).optional(), // honeypot: must stay empty
});

export const inquiryStatusSchema = z.object({ status: z.enum(["PENDING", "CONTACTED", "COMPLETED"]) });

export const galleryCreateSchema = z.object({
  images: z
    .array(imageRef.extend({ title: text(150).optional() }))
    .min(1)
    .max(20),
  destinationId: z.string().max(40).nullish(),
  packageId: z.string().max(40).nullish(),
});

export const galleryUpdateSchema = z.object({
  title: required(150, "Title"),
  description: text(500).nullish(),
  featured: z.boolean(),
  destinationId: z.string().max(40).nullish(),
  packageId: z.string().max(40).nullish(),
});

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Must start with http:// or https://")
  .nullish();

export const settingsSchema = z.object({
  companyName: required(100, "Company name"),
  email: z.string().trim().email().max(200).or(z.literal("")).nullish(),
  phone: text(40).nullish(),
  whatsapp: text(40).nullish(),
  address: text(300).nullish(),
  facebookUrl: optionalUrl,
  instagramUrl: optionalUrl,
  tiktokUrl: optionalUrl,
  youtubeUrl: optionalUrl,
  heroTitle: required(160, "Hero title"),
  heroSubtitle: required(400, "Hero subtitle"),
  heroImageUrl: imageUrl.or(z.literal("")).nullish(),
  logoUrl: imageUrl.or(z.literal("")).nullish(),
  aboutText: text(5000).default(""),
  mission: text(1500).default(""),
  vision: text(1500).default(""),
  footerText: text(500).default(""),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(1).max(200),
});
