import { readFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";
import { slugify } from "../src/lib/utils";

// Blog-Inhalte liegen im Repo (prisma/seed-content) — funktioniert lokal und im Docker-Build.
const CONTENT = join(process.cwd(), "prisma", "seed-content");

function blogHtml(slug: string): string {
  try {
    const raw = readFileSync(join(CONTENT, "blog", `${slug}.html`), "utf8");
    return raw.replace(/<!--[\s\S]*?-->/g, "").trim(); // Metadaten-Kommentare entfernen
  } catch {
    return "<p>Inhalt folgt.</p>";
  }
}

// 1:1-Seiteninhalte: bevorzugt aus prisma/seed-content/pages/<slug>.json laden
// (wortgetreu aus WP extrahiert). Fehlt die Datei -> null -> hartcodierter Fallback.
function sectionsFromJson(slug: string): { type: string; order: number; data: string }[] | null {
  try {
    const raw = readFileSync(join(CONTENT, "pages", `${slug}.json`), "utf8");
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr.map((s: { type: string; data?: unknown }, i: number) => ({
      type: s.type,
      order: i,
      data: JSON.stringify(s.data ?? {}),
    }));
  } catch {
    return null;
  }
}

// Kleine Helfer zum Bauen von Sektionen
let sortCounter = 0;
function section(type: string, data: Record<string, unknown>) {
  return { type, order: sortCounter++, data: JSON.stringify(data) };
}

async function main() {
  console.log("→ Lösche vorhandene Daten …");
  await db.purchase.deleteMany();
  await db.videoProduct.deleteMany();
  await db.customerCourseAccess.deleteMany();
  await db.booking.deleteMany();
  await db.customer.deleteMany();
  await db.courseSession.deleteMany();
  await db.course.deleteMany();
  await db.section.deleteMany();
  await db.page.deleteMany();
  await db.post.deleteMany();
  await db.category.deleteMany();
  await db.enquiry.deleteMany();
  await db.mediaAsset.deleteMany();
  await db.setting.deleteMany();
  await db.user.deleteMany();

  // ---------- Nutzer ----------
  console.log("→ Nutzer …");
  const ownerPw = process.env.SEED_OWNER_PASSWORD || "hundsgescheit2026";
  const adminPw = process.env.SEED_ADMIN_PASSWORD || "fjdesign2026";
  await db.user.create({
    data: {
      email: process.env.SEED_OWNER_EMAIL || "chiara@hundsgescheit.de",
      name: "Chiara",
      role: "OWNER",
      passwordHash: await bcrypt.hash(ownerPw, 10),
    },
  });
  await db.user.create({
    data: {
      email: "admin@fjdesign.de",
      name: "FJ Design",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(adminPw, 10),
    },
  });

  // ---------- Demo-Stammkunde (zum Testen des Login-Bereichs) ----------
  await db.customer.create({
    data: {
      email: "kunde@example.com",
      passwordHash: await bcrypt.hash("kunde2026", 10),
      status: "ACTIVE",
      firstName: "Testkunde",
      lastName: "Muster",
      street: "Musterweg 1",
      zip: "45127",
      city: "Essen",
      phone: "0201 000000",
      dogName: "Balu",
      dogBreed: "Labrador",
      dogAge: "3 Jahre",
      dogProblems: "Leinenpöbeln, Rückruf",
      vaccinationApproved: true,
    },
  });

  // ---------- Demo Online-Kurs (Videothek) ----------
  await db.videoProduct.create({
    data: {
      slug: "trick-aufbau-pfote-geben",
      title: "Trick-Aufbau: Pfote geben",
      description:
        "In diesem kurzen Video zeige ich dir Schritt für Schritt, wie du deinem Hund sauber das Pfotegeben beibringst – mit positiver Verstärkung und ohne Frust.",
      priceCents: 1000,
      videoUrl: "",
      previewUrl: "",
      isPublished: true,
      order: 0,
    },
  });

  // ---------- Einstellungen ----------
  console.log("→ Einstellungen …");
  const settings: Record<string, string> = {
    siteName: "Hundsgescheit",
    tagline: "Hundetraining mit Herz & Verstand",
    email: "kontakt@hundsgescheit.de",
    phone: "",
    city: "Essen",
    region: "Nordrhein-Westfalen",
    country: "Deutschland",
    instagram: "https://www.instagram.com/hundsgescheit/",
    facebook: "",
    metaTitleDefault: "Hundeschule Essen – Hundetraining mit Herz & Verstand",
    metaDescriptionDefault:
      "Hundeschule in Essen & Umgebung: Einzel-, Gruppen- & Onlinecoaching sowie Social Walks. Hundetrainerin Chiara – spezialisiert auf reaktive Hunde, mit Herz & Verstand.",
    openingHours: "Termine nach Vereinbarung",
  };
  await db.setting.createMany({ data: Object.entries(settings).map(([key, value]) => ({ key, value })) });

  // ---------- Kategorie + Blog ----------
  console.log("→ Blog …");
  const cat = await db.category.create({ data: { name: "Hundetraining", slug: "hundetraining" } });

  const posts = [
    {
      slug: "woran-erkennst-du-einen-guten-hundetrainer",
      title: "Woran erkennst du einen guten Hundetrainer?",
      excerpt: "10 Merkmale, an denen du eine:n seriöse:n Hundetrainer:in erkennst – von Verlässlichkeit bis Augenhöhe.",
      cover: "/uploads/2026/06/trainer-emil-olaf-1024x683.jpg",
      date: "2026-06-25T19:01:10Z",
    },
    {
      slug: "begleithundepruefung-wie-viel-sagt-sie-wirklich-aus",
      title: "Begleithundeprüfung – Wie viel sagt sie wirklich aus?",
      excerpt: "Was die Begleithundeprüfung wirklich über dich und deinen Hund aussagt – und was nicht.",
      cover: "/uploads/2026/06/bhp-bestanden-768x1024.jpg",
      date: "2026-06-24T10:00:00Z",
    },
    {
      slug: "wie-verbunden-bist-du-mit-deinem-hund",
      title: "Wie verbunden bist du mit deinem Hund?",
      excerpt: "Bindung ist die Basis für alles. Wie du die Verbindung zu deinem Hund stärkst.",
      cover: "/uploads/2026/06/verbundenheit-olaf-1024x683.jpg",
      date: "2026-06-20T10:00:00Z",
    },
    {
      slug: "ich-habe-angst-ich-mache-es-trotzdem",
      title: "Ich habe Angst – ich mache es trotzdem",
      excerpt: "Über Mut, Unsicherheit und den Weg mit einem reaktiven Hund.",
      cover: "/uploads/2026/06/angst-emil-1024x683.jpg",
      date: "2026-06-15T10:00:00Z",
    },
  ];
  for (const p of posts) {
    await db.post.create({
      data: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        contentHtml: blogHtml(p.slug),
        coverImagePath: p.cover,
        coverImageAlt: p.title,
        status: "PUBLISHED",
        publishedAt: new Date(p.date),
        categoryId: cat.id,
        metaTitle: p.title,
        metaDescription: p.excerpt,
      },
    });
  }

  // ---------- Kurse ----------
  console.log("→ Kurse …");
  const courses = [
    {
      slug: "einzelcoaching",
      title: "Einzelcoaching",
      type: "EINZEL",
      shortDesc: "Individuelle, intensive Betreuung für nachhaltige Erfolge.",
      description:
        "Beim Einzelcoaching betreue ich dich individuell und wir arbeiten intensiv an euren Themen. Der perfekte Weg, wenn du nachhaltig Erfolge erzielen möchtest. Ort und Zeit passe ich an deine Wünsche an.",
      priceLabel: "auf Anfrage",
      capacity: 1,
      color: "#125A70",
      bookable: true,
      img: "/uploads/2026/06/IMG_1747-768x1024.jpeg",
    },
    {
      slug: "gruppencoaching",
      title: "Gruppencoaching",
      type: "GRUPPE",
      shortDesc: "Intensives Arbeiten in der Kleingruppe – für jedes Mensch-Hund-Team.",
      description:
        "Egal ob Alltagstraining, Grunderziehung, Vorbereitung auf die Begleithundeprüfung oder Beschäftigung und Auslastung: Beim Gruppencoaching ist für jedes Mensch-Hund-Team das passende Angebot dabei. Die Arbeit in Kleingruppen ermöglicht intensives Arbeiten in Anwesenheit anderer Hunde.",
      priceLabel: "ab 20 €",
      capacity: 6,
      color: "#4B84A4",
      bookable: true,
      img: "/uploads/2026/06/verbundenheit-olaf-1024x683.jpg",
    },
    {
      slug: "onlinecoaching",
      title: "Onlinecoaching",
      type: "ONLINE",
      shortDesc: "Erfolgreiches Training, wo Präsenztraining an seine Grenzen kommt.",
      description:
        "Egal ob beim Aufbau eines neuen Tricks oder beim Üben des Alleinebleibens: Das Onlinecoaching bietet erfolgsversprechende Trainingsmöglichkeiten, wo das Präsenztraining an seine Grenzen kommt.",
      priceLabel: "auf Anfrage",
      capacity: 1,
      color: "#70CFC0",
      bookable: true,
      img: "/uploads/2026/06/trainer-emil-olaf-1024x683.jpg",
    },
    {
      slug: "socialwalk",
      title: "Social Walk",
      type: "SOCIALWALK",
      shortDesc: "Angeleitetes Spazieren zur Schulung sozialer Kompetenzen.",
      description:
        "Das angeleitete Spazierengehen mit anderen Hunden schult die sozialen Kompetenzen deines Vierbeiners. Dein Hund lernt, Frust auszuhalten, Impulse zu kontrollieren und in Gegenwart anderer Hunde zu entspannen.",
      priceLabel: "ab 20 €",
      capacity: 8,
      color: "#012D67",
      bookable: true,
      img: "/uploads/2026/06/angst-emil-1024x683.jpg",
    },
  ];
  const courseBySlug: Record<string, string> = {};
  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    const created = await db.course.create({
      data: {
        slug: c.slug,
        title: c.title,
        type: c.type,
        shortDesc: c.shortDesc,
        description: c.description,
        priceLabel: c.priceLabel,
        capacity: c.capacity,
        color: c.color,
        isBookable: c.bookable,
        imagePath: c.img,
        order: i,
        location: "Essen und Umgebung",
      },
    });
    courseBySlug[c.slug] = created.id;
  }

  // ---------- Termine (Sessions) für Gruppe + Social Walk, kommende Wochen ----------
  console.log("→ Termine …");
  const now = new Date();
  function nextWeekday(from: Date, weekday: number, hour: number, addWeeks: number) {
    const d = new Date(from);
    d.setHours(hour, 0, 0, 0);
    const delta = (weekday - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + delta + addWeeks * 7);
    return d;
  }
  const sessionPlan = [
    { slug: "gruppencoaching", weekday: 6, hour: 10, weeks: 6 }, // samstags 10 Uhr
    { slug: "socialwalk", weekday: 0, hour: 11, weeks: 6 }, // sonntags 11 Uhr
  ];
  for (const plan of sessionPlan) {
    const courseId = courseBySlug[plan.slug];
    const course = courses.find((c) => c.slug === plan.slug)!;
    for (let w = 0; w < plan.weeks; w++) {
      const start = nextWeekday(now, plan.weekday, plan.hour, w);
      const end = new Date(start.getTime() + 90 * 60000);
      await db.courseSession.create({
        data: {
          courseId,
          startsAt: start,
          endsAt: end,
          capacity: course.capacity,
          location: "Essen",
          status: "SCHEDULED",
        },
      });
    }
  }

  // ---------- Seiten mit Sektionen ----------
  console.log("→ Seiten …");
  const ctaSection = () =>
    section("CTA", {
      heading: "Bereit für den nächsten Schritt?",
      text: "Lass uns gemeinsam an einem harmonischen Zusammenleben mit deinem Hund arbeiten.",
      cta: [{ label: "Jetzt Kontakt aufnehmen", href: "/kontakt" }],
    });

  async function createPage(opts: {
    slug: string;
    title: string;
    navLabel?: string;
    order: number;
    showInNav?: boolean;
    isSystem?: boolean;
    metaTitle?: string;
    metaDescription?: string;
    sections: { type: string; order: number; data: string }[];
  }) {
    const { sections: secs, ...rest } = opts;
    // 1:1-Inhalte aus JSON bevorzugen, sonst hartcodierter Fallback.
    const finalSecs = sectionsFromJson(opts.slug) ?? secs;
    await db.page.create({
      data: {
        ...rest,
        showInNav: opts.showInNav ?? true,
        isSystem: opts.isSystem ?? false,
        sections: { create: finalSecs },
      },
    });
  }

  // Home
  sortCounter = 0;
  await createPage({
    slug: "home",
    title: "Startseite",
    navLabel: "Startseite",
    order: 0,
    isSystem: true,
    metaTitle: "Hundeschule Essen – Hundetraining mit Herz & Verstand",
    metaDescription: settings.metaDescriptionDefault,
    sections: [
      section("HERO", {
        headline: "Herzlich willkommen bei Hundsgescheit",
        subline: "Hundetraining mit Herz & Verstand – für ein starkes Team aus Mensch und Hund. In Essen und Umgebung.",
        image: "/uploads/2026/06/339a0049-2495-404d-9db7-c630ed9d3bed-768x1024.jpeg",
        primary: [{ label: "Jetzt Kontakt aufnehmen", href: "/kontakt" }],
        secondary: [{ label: "Termine ansehen", href: "/termine" }],
      }),
      section("RICHTEXT", {
        heading: "Meine Schwerpunkte als Hundetrainerin",
        html: "<p>Durch das Training und das Zusammenleben mit meinem eigenen impulsiven und reaktiven Hund verstehe ich, wie du dich fühlst. Jedes Mal, wenn dein Hund in die Leine springt, bellt oder vielleicht sogar zubeißen will, möchtest du im Erdboden versinken. Ich zeige dir, wie ihr da gemeinsam rauskommt – ehrlich, fair und auf Augenhöhe.</p>",
      }),
      section("CARDS", {
        heading: "Womit ich dir helfe",
        intro: "",
        cards: [
          { title: "Reaktive Hunde", text: "Bellen, Leinepöbeln, Unsicherheit – wir arbeiten an den Ursachen, nicht nur an Symptomen.", image: "", href: "/einzelcoaching" },
          { title: "Auslastung & Hundesport", text: "JEDER Hund hat das Recht, artgerecht ausgelastet und gefördert zu werden.", image: "", href: "/gruppencoaching" },
          { title: "Das dynamische Trio", text: "Warum ich Hundetrainerin geworden bin? Weil ich es liebe – Beziehung, Wissen und Herz.", image: "", href: "/ueber-uns" },
        ],
      }),
      section("CARDS", {
        heading: "Meine Angebote",
        intro: "Ich verhelfe dir und deinem Hund zu einem harmonischen Zusammenleben. Viele Wege führen nach Rom – finde deinen.",
        cards: [
          { title: "Einzelcoaching", text: "Der Weg der individuellen und intensivsten Betreuung, um nachhaltig Erfolge zu verzeichnen.", image: "/uploads/2026/06/IMG_1747-768x1024.jpeg", href: "/einzelcoaching" },
          { title: "Onlinecoaching", text: "Wo Präsenztraining an seine Grenzen kommt, beginnen die Möglichkeiten des Onlinetrainings.", image: "/uploads/2026/06/trainer-emil-olaf-1024x683.jpg", href: "/onlinecoaching" },
          { title: "Gruppencoaching", text: "Die Arbeit in Kleingruppen ermöglicht intensives Arbeiten in Anwesenheit anderer Hunde.", image: "/uploads/2026/06/verbundenheit-olaf-1024x683.jpg", href: "/gruppencoaching" },
          { title: "Social Walk", text: "Mehr als nur ein gemeinsamer Spaziergang mit anderen Hunden.", image: "/uploads/2026/06/angst-emil-1024x683.jpg", href: "/socialwalk" },
        ],
      }),
      section("COURSES", { heading: "Nächste Termine", intro: "Sichere dir deinen Platz – online buchbar." }),
      ctaSection(),
    ],
  });

  // Über uns
  sortCounter = 0;
  await createPage({
    slug: "ueber-uns",
    title: "Über uns",
    order: 1,
    metaTitle: "Hundetrainerin in Essen – über Chiara & Hundsgescheit",
    metaDescription: "Lerne Chiara kennen – deine Hundetrainerin in Essen. Hundetraining auf Augenhöhe, mit eigener Erfahrung mit reaktiven und impulsiven Hunden.",
    sections: [
      section("HERO", {
        headline: "Über uns",
        subline: "Hundetraining auf Augenhöhe.",
        image: "/uploads/2026/06/IMG_1747-768x1024.jpeg",
        primary: [{ label: "Kontakt", href: "/kontakt" }],
        secondary: [],
      }),
      section("IMAGE_TEXT", {
        heading: "„Manche leben für die Freiheit, andere für die Vernunft.“",
        html: "<p>Mein Name ist Chiara, ich bin 28 Jahre alt und meine Berufung ist das Hundetraining. Bevor ich „auf den Hund gekommen bin“, habe ich Lehramt mit der Fächerkombi Mathe und Sport studiert und erfolgreich abgeschlossen. Heute verbinde ich pädagogisches Wissen mit meiner Leidenschaft für Hunde.</p>",
        image: "/uploads/2026/06/IMG_1747-768x1024.jpeg",
        imageAlt: "Chiara mit Hund",
        imageSide: "right",
      }),
      section("RICHTEXT", {
        heading: "Niemand ist ein besserer Lehrer als die eigenen Hunde.",
        html: "<p>Immer an meiner Seite: meine Hunde Olaf (Labrador Retriever) und Emil. Olaf ist 2020 bei mir eingezogen und hat mir gezeigt, was es heißt, mit einem impulsiven Hund zu leben – und daran zu wachsen. Diese Erfahrung fließt in jedes Training ein.</p>",
      }),
      section("CARDS", {
        heading: "Unser Blog & Tipps",
        intro: "",
        cards: posts.map((p) => ({ title: p.title, text: p.excerpt, image: p.cover, href: `/blog/${p.slug}` })),
      }),
      ctaSection(),
    ],
  });

  // Dienstleistungen
  sortCounter = 0;
  await createPage({
    slug: "dienstleistungen",
    title: "Dienstleistungen",
    order: 2,
    metaTitle: "Hundetraining Essen – Einzel-, Gruppen- & Onlinecoaching",
    metaDescription: "Hundetraining & Coaching in Essen: Einzelcoaching, Gruppencoaching, Onlinecoaching und Social Walk. Finde das passende Angebot für dich und deinen Hund.",
    sections: [
      section("HERO", {
        headline: "Dienstleistungen",
        subline: "Auslastung & Reaktivität – für jedes Mensch-Hund-Team das passende Angebot.",
        image: "",
        primary: [{ label: "Termine ansehen", href: "/termine" }],
        secondary: [{ label: "Kontakt", href: "/kontakt" }],
      }),
      section("RICHTEXT", {
        heading: "Meine eigenen Hunde sind meine größte Inspiration",
        html: "<p>Wenn ich mit meinen Hunden arbeite, vergesse ich alles um mich herum. Genau diese Begeisterung möchte ich an dich weitergeben – mit einem Training, das zu euch passt.</p>",
      }),
      section("CARDS", {
        heading: "Meine Angebote im Überblick",
        intro: "",
        cards: [
          { title: "Einzelcoaching", text: courses[0].description, image: courses[0].img, href: "/einzelcoaching" },
          { title: "Onlinecoaching", text: courses[2].description, image: courses[2].img, href: "/onlinecoaching" },
          { title: "Gruppencoaching", text: courses[1].description, image: courses[1].img, href: "/gruppencoaching" },
          { title: "Social Walk", text: courses[3].description, image: courses[3].img, href: "/socialwalk" },
        ],
      }),
      ctaSection(),
    ],
  });

  // Coaching-Detailseiten
  for (let i = 0; i < courses.length; i++) {
    const c = courses[i];
    sortCounter = 0;
    await createPage({
      slug: c.slug,
      title: c.title,
      order: 3 + i,
      showInNav: true, // erscheinen als Dropdown-Kinder von "Dienstleistungen"
      metaTitle: `${c.title} in Essen – Hundetraining`,
      metaDescription: `${c.shortDesc} Hundetraining in Essen und Umgebung.`,
      sections: [
        section("HERO", {
          headline: c.title,
          subline: c.shortDesc,
          image: c.img,
          primary: [{ label: "Jetzt anfragen", href: "/kontakt" }],
          secondary: c.bookable ? [{ label: "Termine ansehen", href: "/termine" }] : [],
        }),
        section("RICHTEXT", { heading: "Worum es geht", html: `<p>${c.description}</p>` }),
        section("COURSES", { heading: "Passende Termine", intro: "" }),
        ctaSection(),
      ],
    });
  }

  // Kontakt
  sortCounter = 0;
  await createPage({
    slug: "kontakt",
    title: "Kontakt",
    order: 10,
    showInNav: false, // eigener CTA-Button im Header
    metaTitle: "Kontakt – Hundetraining in Essen anfragen",
    metaDescription: "Kontakt zu Hundsgescheit – deiner Hundeschule in Essen und Umgebung. Schreib mir für ein unverbindliches Erstgespräch.",
    sections: [
      section("CONTACT", {
        heading: "Nimm Kontakt mit mir auf",
        text: "Neugierig auf meine Leistungen? So geht's weiter – schreib mir und ich melde mich zeitnah zurück.",
      }),
    ],
  });

  // Rechtstexte (Platzhalter – echte Texte via CMS einpflegen)
  const legal = [
    { slug: "impressum", title: "Impressum" },
    { slug: "datenschutz", title: "Datenschutzerklärung" },
    { slug: "agb", title: "AGB" },
  ];
  for (let i = 0; i < legal.length; i++) {
    sortCounter = 0;
    await createPage({
      slug: legal[i].slug,
      title: legal[i].title,
      order: 20 + i,
      showInNav: false,
      isSystem: true,
      metaTitle: `${legal[i].title} | Hundsgescheit`,
      sections: [
        section("RICHTEXT", {
          heading: legal[i].title,
          html: `<p>Dieser Rechtstext wird noch eingepflegt. Bitte im Adminbereich unter „Seiten → ${legal[i].title}“ den finalen Text einfügen (aus dem bestehenden WordPress übernehmen oder neu generieren).</p>`,
        }),
      ],
    });
  }

  console.log("✓ Seed abgeschlossen.");
  console.log("  Login OWNER: chiara@hundsgescheit.de / hundsgescheit2026");
  console.log("  Login ADMIN: admin@fjdesign.de / fjdesign2026");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
