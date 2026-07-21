"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { defaultDataFor } from "@/lib/sections";
import { slugify } from "@/lib/utils";

async function guard() {
  await requireUser();
}

function refreshPublic() {
  revalidatePath("/", "layout");
}

// ---------- Seiten ----------
export async function createPage(formData: FormData) {
  await guard();
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  let slug = slugify(String(formData.get("slug") || title));
  // Slug eindeutig machen
  while (await db.page.findUnique({ where: { slug } })) slug = `${slug}-2`;
  const page = await db.page.create({
    data: { title, slug, order: 99, showInNav: false, isPublished: false },
  });
  refreshPublic();
  redirect(`/admin/seiten/${page.id}`);
}

export async function updatePageMeta(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  await db.page.update({
    where: { id },
    data: {
      title: String(formData.get("title") || ""),
      navLabel: String(formData.get("navLabel") || "") || null,
      isPublished: formData.get("isPublished") === "on",
      showInNav: formData.get("showInNav") === "on",
      order: Number(formData.get("order") || 0),
      metaTitle: String(formData.get("metaTitle") || "") || null,
      metaDescription: String(formData.get("metaDescription") || "") || null,
    },
  });
  refreshPublic();
  revalidatePath(`/admin/seiten/${id}`);
}

export async function deletePage(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  const page = await db.page.findUnique({ where: { id } });
  if (page && !page.isSystem) await db.page.delete({ where: { id } });
  refreshPublic();
  redirect("/admin/seiten");
}

// ---------- Sektionen ----------
export async function addSection(formData: FormData) {
  await guard();
  const pageId = String(formData.get("pageId"));
  const type = String(formData.get("type"));
  const count = await db.section.count({ where: { pageId } });
  await db.section.create({
    data: { pageId, type, order: count, data: JSON.stringify(defaultDataFor(type)) },
  });
  refreshPublic();
  revalidatePath(`/admin/seiten/${pageId}`);
}

export async function updateSection(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  const pageId = String(formData.get("pageId"));
  const data = String(formData.get("data") || "{}");
  await db.section.update({ where: { id }, data: { data } });
  refreshPublic();
  revalidatePath(`/admin/seiten/${pageId}`);
}

export async function deleteSection(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  const pageId = String(formData.get("pageId"));
  await db.section.delete({ where: { id } });
  refreshPublic();
  revalidatePath(`/admin/seiten/${pageId}`);
}

export async function toggleSection(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  const pageId = String(formData.get("pageId"));
  const sec = await db.section.findUnique({ where: { id } });
  if (sec) await db.section.update({ where: { id }, data: { isVisible: !sec.isVisible } });
  refreshPublic();
  revalidatePath(`/admin/seiten/${pageId}`);
}

export async function moveSection(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  const pageId = String(formData.get("pageId"));
  const dir = String(formData.get("dir")); // up | down
  const sections = await db.section.findMany({ where: { pageId }, orderBy: { order: "asc" } });
  const idx = sections.findIndex((s) => s.id === id);
  const swapWith = dir === "up" ? idx - 1 : idx + 1;
  if (idx >= 0 && swapWith >= 0 && swapWith < sections.length) {
    const a = sections[idx];
    const b = sections[swapWith];
    await db.$transaction([
      db.section.update({ where: { id: a.id }, data: { order: b.order } }),
      db.section.update({ where: { id: b.id }, data: { order: a.order } }),
    ]);
  }
  refreshPublic();
  revalidatePath(`/admin/seiten/${pageId}`);
}

// ---------- Blog ----------
export async function createPost(formData: FormData) {
  await guard();
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  let slug = slugify(String(formData.get("slug") || title));
  while (await db.post.findUnique({ where: { slug } })) slug = `${slug}-2`;
  const post = await db.post.create({ data: { title, slug, status: "DRAFT" } });
  redirect(`/admin/blog/${post.id}`);
}

export async function updatePost(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  const publish = formData.get("status") === "PUBLISHED";
  const existing = await db.post.findUnique({ where: { id } });
  await db.post.update({
    where: { id },
    data: {
      title: String(formData.get("title") || ""),
      excerpt: String(formData.get("excerpt") || ""),
      contentHtml: String(formData.get("contentHtml") || ""),
      coverImagePath: String(formData.get("coverImagePath") || "") || null,
      coverImageAlt: String(formData.get("coverImageAlt") || ""),
      metaTitle: String(formData.get("metaTitle") || "") || null,
      metaDescription: String(formData.get("metaDescription") || "") || null,
      status: publish ? "PUBLISHED" : "DRAFT",
      publishedAt: publish ? existing?.publishedAt ?? new Date() : existing?.publishedAt ?? null,
    },
  });
  refreshPublic();
  revalidatePath(`/admin/blog/${id}`);
}

export async function deletePost(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  await db.post.delete({ where: { id } });
  refreshPublic();
  redirect("/admin/blog");
}

// ---------- Kurse ----------
export async function saveCourse(formData: FormData) {
  await guard();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  const data = {
    title,
    shortDesc: String(formData.get("shortDesc") || ""),
    description: String(formData.get("description") || ""),
    type: String(formData.get("type") || "GRUPPE"),
    priceLabel: String(formData.get("priceLabel") || ""),
    capacity: Number(formData.get("capacity") || 6),
    durationMin: Number(formData.get("durationMin") || 60),
    location: String(formData.get("location") || ""),
    color: String(formData.get("color") || "#125A70"),
    imagePath: String(formData.get("imagePath") || "") || null,
    isActive: formData.get("isActive") === "on",
    isBookable: formData.get("isBookable") === "on",
    membersOnly: formData.get("membersOnly") === "on",
    requiresCourseId: String(formData.get("requiresCourseId") || "") || null,
  };
  if (id) {
    await db.course.update({ where: { id }, data });
  } else {
    let slug = slugify(title);
    while (await db.course.findUnique({ where: { slug } })) slug = `${slug}-2`;
    await db.course.create({ data: { ...data, slug, order: 99 } });
  }
  refreshPublic();
  redirect("/admin/kurse");
}

export async function deleteCourse(formData: FormData) {
  await guard();
  await db.course.delete({ where: { id: String(formData.get("id")) } });
  refreshPublic();
  redirect("/admin/kurse");
}

// ---------- Termine (Sessions) ----------
export async function createSession(formData: FormData) {
  await guard();
  const courseId = String(formData.get("courseId"));
  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return;
  const start = new Date(String(formData.get("startsAt")));
  const durationMin = Number(formData.get("durationMin") || course.durationMin);
  const end = new Date(start.getTime() + durationMin * 60000);
  await db.courseSession.create({
    data: {
      courseId,
      startsAt: start,
      endsAt: end,
      capacity: Number(formData.get("capacity") || course.capacity),
      location: String(formData.get("location") || course.location),
      note: String(formData.get("note") || ""),
    },
  });
  refreshPublic();
  revalidatePath("/admin/termine");
}

export async function updateSessionStatus(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  await db.courseSession.update({ where: { id }, data: { status: String(formData.get("status")) } });
  refreshPublic();
  revalidatePath("/admin/termine");
}

export async function deleteSession(formData: FormData) {
  await guard();
  await db.courseSession.delete({ where: { id: String(formData.get("id")) } });
  refreshPublic();
  revalidatePath("/admin/termine");
}

// ---------- Buchungen ----------
export async function setBookingStatus(formData: FormData) {
  await guard();
  await db.booking.update({
    where: { id: String(formData.get("id")) },
    data: { status: String(formData.get("status")) },
  });
  revalidatePath("/admin/termine");
}

// ---------- Anfragen ----------
export async function markEnquiryRead(formData: FormData) {
  await guard();
  await db.enquiry.update({ where: { id: String(formData.get("id")) }, data: { isRead: true } });
  revalidatePath("/admin/anfragen");
}
export async function deleteEnquiry(formData: FormData) {
  await guard();
  await db.enquiry.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/anfragen");
}

// ---------- Stammkunden verwalten ----------
export async function inviteCustomer(formData: FormData) {
  await guard();
  const email = String(formData.get("email") || "").toLowerCase().trim();
  if (!email) return;
  const token = randomBytes(24).toString("base64url");
  await db.customer.upsert({
    where: { email },
    update: { inviteToken: token, status: "INVITED" },
    create: {
      email,
      inviteToken: token,
      status: "INVITED",
      firstName: String(formData.get("firstName") || ""),
      lastName: String(formData.get("lastName") || ""),
      notes: String(formData.get("notes") || ""),
    },
  });
  revalidatePath("/admin/kunden");
}

export async function setCustomerStatus(formData: FormData) {
  await guard();
  await db.customer.update({
    where: { id: String(formData.get("id")) },
    data: { status: String(formData.get("status")) },
  });
  revalidatePath("/admin/kunden");
}

export async function approveVaccination(formData: FormData) {
  await guard();
  await db.customer.update({
    where: { id: String(formData.get("id")) },
    data: { vaccinationApproved: formData.get("approved") === "1" },
  });
  revalidatePath(`/admin/kunden/${String(formData.get("id"))}`);
}

export async function saveCustomerNotes(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  await db.customer.update({ where: { id }, data: { notes: String(formData.get("notes") || "") } });
  revalidatePath(`/admin/kunden/${id}`);
}

export async function regenerateInvite(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  await db.customer.update({ where: { id }, data: { inviteToken: randomBytes(24).toString("base64url"), status: "INVITED" } });
  revalidatePath(`/admin/kunden/${id}`);
}

// Kurs-Freigabe/Fortschritt je Kunde (LOCKED | UNLOCKED | COMPLETED)
export async function setCourseAccess(formData: FormData) {
  await guard();
  const customerId = String(formData.get("customerId"));
  const courseId = String(formData.get("courseId"));
  const status = String(formData.get("status"));
  await db.customerCourseAccess.upsert({
    where: { customerId_courseId: { customerId, courseId } },
    update: { status },
    create: { customerId, courseId, status },
  });
  revalidatePath(`/admin/kunden/${customerId}`);
}

// ---------- Online-Kurse / Videothek ----------
export async function saveVideoProduct(formData: FormData) {
  await guard();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const data = {
    title,
    description: String(formData.get("description") || ""),
    priceCents: Math.round(Number(formData.get("priceEuro") || 0) * 100),
    coverPath: String(formData.get("coverPath") || "") || null,
    videoUrl: String(formData.get("videoUrl") || ""),
    previewUrl: String(formData.get("previewUrl") || ""),
    isPublished: formData.get("isPublished") === "on",
  };
  if (id) {
    await db.videoProduct.update({ where: { id }, data });
  } else {
    let slug = slugify(title);
    while (await db.videoProduct.findUnique({ where: { slug } })) slug = `${slug}-2`;
    await db.videoProduct.create({ data: { ...data, slug, order: 99 } });
  }
  refreshPublic();
  redirect("/admin/videos");
}

export async function deleteVideoProduct(formData: FormData) {
  await guard();
  await db.videoProduct.delete({ where: { id: String(formData.get("id")) } });
  refreshPublic();
  redirect("/admin/videos");
}

// ---------- Einstellungen ----------
export async function saveSettings(formData: FormData) {
  await guard();
  const keys = [
    "siteName", "tagline", "email", "phone", "street", "zip", "city", "region",
    "country", "lat", "lng", "openingHours", "instagram", "facebook",
    "metaTitleDefault", "metaDescriptionDefault",
    "colorPrimary", "colorSecondary", "colorAccent", "colorNavy",
  ];
  await Promise.all(
    keys.map((k) =>
      db.setting.upsert({
        where: { key: k },
        update: { value: String(formData.get(k) || "") },
        create: { key: k, value: String(formData.get(k) || "") },
      }),
    ),
  );
  refreshPublic();
  revalidatePath("/admin/einstellungen");
}
