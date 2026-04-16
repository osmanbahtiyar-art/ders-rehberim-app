// ── Başvuru Yönetimi (localStorage tabanlı) ──────────────────────────
// Öğrenci ve öğretmen başvurularını localStorage'da saklar.
// Admin paneli aynı cihazdan veya export/import ile erişebilir.

export type ApplicationType = "student" | "teacher";
export type ApplicationStatus = "pending" | "contacted" | "accepted" | "rejected";

export interface StudentApplicationData {
  fullname: string;
  email: string;
  phone: string;
  grade: string;
  subjects: string[];
  note: string;
}

export interface TeacherApplicationData {
  fullname: string;
  email: string;
  phone: string;
  branch: string;
  experience: string;
  qualifications: string;
  hourlyRate: string;
  about: string;
  availableDays: string[];
}

export interface Application {
  id: string;
  type: ApplicationType;
  status: ApplicationStatus;
  submittedAt: string;
  note?: string; // admin notu
  data: StudentApplicationData | TeacherApplicationData;
}

const KEY = "odr-applications";

function loadAll(): Application[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAll(apps: Application[]): void {
  localStorage.setItem(KEY, JSON.stringify(apps));
}

function uuid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const applicationStore = {
  list(): Application[] {
    return loadAll().sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  },

  listByType(type: ApplicationType): Application[] {
    return applicationStore.list().filter((a) => a.type === type);
  },

  add(type: ApplicationType, data: StudentApplicationData | TeacherApplicationData): Application {
    const apps = loadAll();
    const newApp: Application = {
      id: uuid(),
      type,
      status: "pending",
      submittedAt: new Date().toISOString(),
      data,
    };
    apps.push(newApp);
    saveAll(apps);
    return newApp;
  },

  updateStatus(id: string, status: ApplicationStatus, note?: string): void {
    const apps = loadAll();
    const idx = apps.findIndex((a) => a.id === id);
    if (idx !== -1) {
      apps[idx].status = status;
      if (note !== undefined) apps[idx].note = note;
      saveAll(apps);
    }
  },

  delete(id: string): void {
    saveAll(loadAll().filter((a) => a.id !== id));
  },

  exportJSON(): string {
    return JSON.stringify(loadAll(), null, 2);
  },

  exportCSV(): string {
    const apps = loadAll();
    if (apps.length === 0) return "";
    const rows: string[] = [
      "ID,Tür,Durum,Tarih,Ad Soyad,E-posta,Telefon,Detay",
    ];
    for (const a of apps) {
      const d = a.data as Record<string, unknown>;
      const detail =
        a.type === "student"
          ? `Sınıf: ${d.grade ?? ""} | Dersler: ${(d.subjects as string[] ?? []).join("+")} | Not: ${d.note ?? ""}`
          : `Branş: ${d.branch ?? ""} | Deneyim: ${d.experience ?? ""} yıl | Ücret: ₺${d.hourlyRate ?? ""}/sa`;
      rows.push(
        [
          a.id,
          a.type === "student" ? "Öğrenci" : "Öğretmen",
          statusTR[a.status],
          new Date(a.submittedAt).toLocaleString("tr-TR"),
          d.fullname ?? "",
          d.email ?? "",
          d.phone ?? "",
          `"${detail.replace(/"/g, "'")}"`,
        ].join(",")
      );
    }
    return rows.join("\n");
  },

  counts() {
    const all = loadAll();
    return {
      total: all.length,
      student: all.filter((a) => a.type === "student").length,
      teacher: all.filter((a) => a.type === "teacher").length,
      pending: all.filter((a) => a.status === "pending").length,
    };
  },
};

// ── Eşleştirme Sistemi ───────────────────────────────────────────

export type MatchStatus = "pending" | "approved" | "rejected";

export interface Match {
  id: string;
  studentAppId: string;
  teacherAppId: string;
  subject: string;
  status: MatchStatus;
  createdAt: string;
}

const MATCH_KEY = "odr-matches";

function loadMatches(): Match[] {
  try { return JSON.parse(localStorage.getItem(MATCH_KEY) || "[]"); }
  catch { return []; }
}

function saveMatches(m: Match[]): void {
  localStorage.setItem(MATCH_KEY, JSON.stringify(m));
}

/** Verilen başvurulardan öğrenci-öğretmen eşleştirme önerileri üretir. */
export function generateMatchSuggestions(apps: Application[]): Match[] {
  const studentApps = apps.filter((a) => a.type === "student" && a.status !== "rejected");
  const teacherApps = apps.filter((a) => a.type === "teacher" && a.status !== "rejected");
  const existing = loadMatches();

  const newMatches: Match[] = [];

  for (const sa of studentApps) {
    const subjects = ((sa.data as StudentApplicationData).subjects ?? []).map((s) => s.trim().toLowerCase());
    for (const ta of teacherApps) {
      const branch = ((ta.data as TeacherApplicationData).branch ?? "").trim().toLowerCase();
      if (!branch) continue;

      const matchingSubject = subjects.find(
        (s) => s === branch || branch.includes(s) || s.includes(branch)
      );
      if (!matchingSubject) continue;

      const alreadyExists = existing.some(
        (m) => m.studentAppId === sa.id && m.teacherAppId === ta.id
      );
      if (alreadyExists) continue;

      newMatches.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        studentAppId: sa.id,
        teacherAppId: ta.id,
        subject: matchingSubject,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    }
  }

  const all = [...existing, ...newMatches];
  saveMatches(all);
  return all;
}

/** Öğrencilerin istediği ama öğretmen başvurusu olmayan dersler. */
export function getSubjectGaps(apps: Application[]): Array<{ subject: string; count: number }> {
  const studentApps = apps.filter((a) => a.type === "student" && a.status !== "rejected");
  const teacherApps = apps.filter((a) => a.type === "teacher" && a.status !== "rejected");

  const teacherBranches = teacherApps.map((a) =>
    ((a.data as TeacherApplicationData).branch ?? "").trim().toLowerCase()
  );

  const subjectCount: Record<string, number> = {};
  for (const app of studentApps) {
    for (const s of (app.data as StudentApplicationData).subjects ?? []) {
      const key = s.trim().toLowerCase();
      if (key) subjectCount[key] = (subjectCount[key] ?? 0) + 1;
    }
  }

  return Object.entries(subjectCount)
    .filter(([subj]) => !teacherBranches.some((b) => b.includes(subj) || subj.includes(b)))
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count);
}

export const matchStore = {
  list(): Match[] { return loadMatches(); },

  updateStatus(id: string, status: MatchStatus): void {
    const matches = loadMatches();
    const idx = matches.findIndex((m) => m.id === id);
    if (idx !== -1) { matches[idx].status = status; saveMatches(matches); }
  },

  counts() {
    const all = loadMatches();
    return {
      pending: all.filter((m) => m.status === "pending").length,
      approved: all.filter((m) => m.status === "approved").length,
    };
  },
};

// ─────────────────────────────────────────────────────────────────

export const statusTR: Record<ApplicationStatus, string> = {
  pending: "Bekliyor",
  contacted: "İletişime Geçildi",
  accepted: "Kabul Edildi",
  rejected: "Reddedildi",
};

export const statusColor: Record<ApplicationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  contacted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  accepted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};
