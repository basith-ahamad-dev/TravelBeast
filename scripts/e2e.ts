/* End-to-end API test against a running server (default http://localhost:3000).
   Usage: npm run test:e2e   (server + database must be running and seeded) */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.E2E_BASE || "http://localhost:3000";
const EMAIL = process.env.SEED_ADMIN_EMAIL!;
const PASSWORD = process.env.SEED_ADMIN_PASSWORD!;
let cookie = "";
let passed = 0;
const failures: string[] = [];

function check(name: string, cond: unknown, extra?: unknown) {
  if (cond) { passed++; console.log(`  ✓ ${name}`); }
  else { failures.push(name); console.log(`  ✗ ${name}`, extra ?? ""); }
}

async function call(method: string, url: string, body?: unknown, opts: { auth?: boolean; form?: FormData } = {}) {
  const headers: Record<string, string> = {};
  if (opts.auth !== false && cookie) headers.cookie = cookie;
  let payload: BodyInit | undefined;
  if (opts.form) payload = opts.form;
  else if (body !== undefined) { headers["content-type"] = "application/json"; payload = JSON.stringify(body); }
  const res = await fetch(BASE + url, { method, headers, body: payload, redirect: "manual" });
  const text = await res.text();
  let data: any = {};
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  return { status: res.status, data, res };
}

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
const png = (name = "pixel.png") => new File([new Uint8Array(PNG)], name, { type: "image/png" });

async function upload(files: File[]) {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  return call("POST", "/api/upload", undefined, { form });
}

async function main() {
  console.log("\n# Authentication & authorization");
  let r = await call("GET", "/admin/dashboard", undefined, { auth: false });
  check("unauthenticated /admin/dashboard redirects to login", r.status === 307 && r.res.headers.get("location")?.includes("/admin/login"));
  r = await call("POST", "/api/packages", { title: "x" }, { auth: false });
  check("POST /api/packages without session -> 401", r.status === 401);
  r = await call("POST", "/api/upload", undefined, { auth: false, form: (() => { const f = new FormData(); f.append("files", png()); return f; })() });
  check("POST /api/upload without session -> 401", r.status === 401);
  r = await call("GET", "/api/inquiries", undefined, { auth: false });
  check("GET /api/inquiries without session -> 401", r.status === 401);
  r = await call("PUT", "/api/settings", {}, { auth: false });
  check("PUT /api/settings without session -> 401", r.status === 401);
  r = await call("POST", "/api/auth/login", { email: EMAIL, password: "wrong-password" }, { auth: false });
  check("login with wrong password -> 401", r.status === 401);
  r = await call("POST", "/api/auth/login", { email: EMAIL, password: PASSWORD }, { auth: false });
  check("login with correct password -> 200", r.status === 200, r.data);
  const set = r.res.headers.get("set-cookie") ?? "";
  check("session cookie is HttpOnly", /httponly/i.test(set));
  cookie = set.split(";")[0];
  r = await call("GET", "/admin/dashboard");
  check("authenticated /admin/dashboard -> 200", r.status === 200);
  r = await call("POST", "/api/packages", { title: "x" }, { auth: true });
  check("server-side validation rejects invalid package -> 400", r.status === 400 && r.data.fields, r.data);
  r = await call("POST", "/api/packages", { title: "x" });
  const forged = await fetch(BASE + "/api/packages", { method: "POST", headers: { cookie, "content-type": "application/json", origin: "https://evil.example" }, body: "{}" });
  check("cross-origin write is blocked -> 403", forged.status === 403);

  console.log("\n# Image upload");
  r = await upload([new File([new TextEncoder().encode("<?php echo 1; ?>")], "evil.png", { type: "image/png" })]);
  check("fake image (wrong magic bytes) rejected -> 415", r.status === 415, r.data);
  r = await upload([new File([new Uint8Array(9 * 1024 * 1024)], "big.png", { type: "image/png" })]);
  check("file over 8 MB rejected -> 413", r.status === 413, r.data);
  r = await upload([png("a.png"), png("b.png")]);
  check("multiple valid images upload -> 201", r.status === 201 && r.data.images?.length === 2, r.data);
  const [imgA, imgB] = r.data.images;
  const mediaRes = await fetch(BASE + imgA.url);
  check("uploaded image is served", mediaRes.status === 200 && (mediaRes.headers.get("content-type") || "").startsWith("image/"));
  const trav = await fetch(BASE + "/media/..%2F..%2F.env");
  check("media route blocks path traversal", trav.status === 404);

  console.log("\n# Destination CRUD");
  r = await call("POST", "/api/destinations", { name: "E2E Testland", country: "Testonia", shortDescription: "A test destination", description: "desc", published: true, cover: imgA });
  check("create destination -> 201", r.status === 201, r.data);
  const dest = r.data;
  check("slug generated", dest.slug === "e2e-testland");
  r = await call("PUT", `/api/destinations/${dest.id}`, { name: "E2E Testland", country: "Testonia", shortDescription: "Updated desc", description: "d", published: true, featured: false, cover: imgA });
  check("update destination", r.status === 200 && r.data.shortDescription === "Updated desc", r.data);

  console.log("\n# Package CRUD");
  const pkgBody = {
    title: "E2E Test Package", shortDescription: "Short", description: "Long description", durationDays: 3, durationNights: 2, price: 777,
    currency: "USD", destinationId: dest.id, included: ["Hotel", "Breakfast"], excluded: ["Flights"], importantInfo: "Bring passport",
    featured: true, published: true, cover: imgA, images: [imgB],
    itinerary: [{ title: "Arrive", description: "Land" }, { title: "Explore", description: "Sights" }],
  };
  r = await call("POST", "/api/packages", pkgBody);
  check("create package -> 201", r.status === 201, r.data);
  const pkg = r.data;
  r = await call("GET", "/api/packages?q=E2E");
  check("public API lists published package", r.data.items?.some((p: any) => p.id === pkg.id), r.data);
  r = await call("GET", "/api/packages?maxPrice=100&q=E2E", undefined, { auth: false });
  check("price filter excludes it", !r.data.items?.some((p: any) => p.id === pkg.id));
  let page = await call("GET", `/packages/${pkg.slug}`, undefined, { auth: false });
  check("package details page renders DB content", page.status === 200 && page.data.raw.includes("E2E Test Package") && page.data.raw.includes("Bring passport") && page.data.raw.includes("Explore"));
  page = await call("GET", "/", undefined, { auth: false });
  check("homepage shows featured package from DB", page.data.raw.includes("E2E Test Package"));
  r = await call("PATCH", `/api/packages/${pkg.id}`, { published: false });
  check("unpublish package", r.status === 200 && r.data.published === false);
  page = await call("GET", `/packages/${pkg.slug}`, undefined, { auth: false });
  check("unpublished package -> 404 publicly", page.status === 404);
  r = await call("PATCH", `/api/packages/${pkg.id}`, { published: true });
  r = await call("PUT", `/api/packages/${pkg.id}`, { ...pkgBody, title: "E2E Test Package v2", price: 888, images: [], itinerary: [{ title: "Only day", description: "x" }] });
  check("update package", r.status === 200 && r.data.price === 888, r.data);
  const gone = await fetch(BASE + imgB.url);
  check("removed gallery image deleted from storage", gone.status === 404);
  r = await call("DELETE", `/api/destinations/${dest.id}`);
  check("cannot delete destination that has packages -> 409", r.status === 409, r.data);

  console.log("\n# Reviews");
  r = await call("POST", "/api/reviews", { customerName: "E2E Reviewer", rating: 9, text: "x" });
  check("rating > 5 rejected -> 400", r.status === 400);
  const up = await upload([png("rev.png")]);
  r = await call("POST", "/api/reviews", { customerName: "E2E Reviewer", rating: 5, text: "Wonderful trip!", published: true, images: up.data.images, packageId: pkg.id });
  check("create review -> 201", r.status === 201, r.data);
  const rev = r.data;
  page = await call("GET", "/", undefined, { auth: false });
  check("published review appears on homepage", page.data.raw.includes("Wonderful trip!"));
  await call("PATCH", `/api/reviews/${rev.id}`, { published: false });
  page = await call("GET", "/", undefined, { auth: false });
  check("hidden review disappears from homepage", !page.data.raw.includes("Wonderful trip!"));

  console.log("\n# Inquiries");
  r = await call("POST", "/api/inquiries", { name: "A", email: "not-an-email", message: "" }, { auth: false });
  check("invalid inquiry rejected -> 400", r.status === 400 && r.data.fields?.email, r.data);
  r = await call("POST", "/api/inquiries", { name: "E2E Visitor", email: "visitor@example.com", phone: "+1 555 0100", message: "Is this available in May?", packageId: pkg.id }, { auth: false });
  check("public inquiry accepted without login -> 201", r.status === 201, r.data);
  r = await call("GET", "/api/inquiries?status=PENDING");
  const inq = r.data.items?.find((i: any) => i.name === "E2E Visitor");
  check("admin sees inquiry (paginated)", !!inq && typeof r.data.pages === "number", r.data);
  r = await call("PATCH", `/api/inquiries/${inq.id}`, { status: "CONTACTED" });
  check("mark inquiry contacted", r.data.status === "CONTACTED");
  r = await call("PATCH", `/api/inquiries/${inq.id}`, { status: "HACKED" });
  check("invalid status rejected", r.status === 400);
  r = await call("DELETE", `/api/inquiries/${inq.id}`);
  check("delete inquiry", r.status === 200);

  console.log("\n# Gallery");
  const up2 = await upload([png("g1.png"), png("g2.png")]);
  r = await call("POST", "/api/gallery", { images: up2.data.images, destinationId: dest.id });
  check("add images to gallery -> 201", r.status === 201 && r.data.length === 2, r.data);
  const g = r.data[0];
  r = await call("PUT", `/api/gallery/${g.id}`, { title: "Beach sunrise", description: "d", featured: true, destinationId: dest.id, packageId: null });
  check("edit gallery title/featured", r.status === 200 && r.data.featured === true);
  page = await call("GET", `/destinations/${dest.slug}`, undefined, { auth: false });
  check("destination page shows packages + gallery", page.data.raw.includes("E2E Test Package v2") && page.data.raw.includes("Beach sunrise"));
  r = await call("DELETE", `/api/gallery/${g.id}`);
  check("delete gallery image", r.status === 200);
  check("gallery file removed from storage", (await fetch(BASE + up2.data.images[0].url)).status === 404);

  console.log("\n# Settings");
  const cur = (await call("GET", "/api/settings")).data;
  r = await call("PUT", "/api/settings", { ...cur, facebookUrl: "javascript:alert(1)" });
  check("non-http social URL rejected", r.status === 400);
  r = await call("PUT", "/api/settings", { ...cur, phone: "+1 555 0199", footerText: "E2E footer text" });
  check("update settings", r.status === 200);
  page = await call("GET", "/contact", undefined, { auth: false });
  check("settings reflected on public site", page.data.raw.includes("+1 555 0199"));
  await call("PUT", "/api/settings", { ...cur }); // restore

  console.log("\n# Cleanup");
  r = await call("DELETE", `/api/reviews/${rev.id}`);
  check("delete review", r.status === 200);
  r = await call("DELETE", `/api/packages/${pkg.id}`);
  check("delete package", r.status === 200);
  check("package cover removed from storage", (await fetch(BASE + imgA.url)).status === 404);
  r = await call("DELETE", `/api/destinations/${dest.id}`);
  check("delete destination", r.status === 200, r.data);
  r = await call("POST", "/api/auth/logout");
  check("logout", r.status === 200);
  cookie = "";
  r = await call("GET", "/admin/packages", undefined, { auth: false });
  check("after logout admin is protected again", r.status === 307);

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length) { console.log("FAILED:\n - " + failures.join("\n - ")); process.exit(1); }
}

main().catch((e) => { console.error(e); process.exit(1); });
void fs; void path;
