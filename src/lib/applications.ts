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
