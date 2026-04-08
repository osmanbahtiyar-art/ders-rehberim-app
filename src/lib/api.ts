const BASE = '/odr-api';

const TOKEN_KEY = 'odr-access-token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function req<T>(service: string, path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['odr-access-token'] = token;

  const res = await fetch(`${BASE}/${service}${path}`, { ...options, headers });

  const newToken = res.headers.get('odr-access-token');
  if (newToken) setToken(newToken);

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API hatası');
  return data;
}

// ---- Auth ----

export const authApi = {
  login: async (username: string, password: string) => {
    const res = await fetch(`${BASE}/auth-api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const newToken = res.headers.get('odr-access-token');
    if (newToken) setToken(newToken);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Giriş başarısız');
    return data;
  },

  logout: async () => {
    try {
      await fetch(`${BASE}/auth-api/logout`, {
        method: 'POST',
        headers: { 'odr-access-token': getToken() || '' },
      });
    } finally {
      clearToken();
    }
  },

  currentUser: async () => {
    return req<OdrSession>('auth-api', '/currentuser');
  },

  register: async (params: { email: string; password: string; fullname: string }) => {
    return req<OdrSession>('auth-api', '/v1/registeruser', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// ---- Teacher Profile ----

export const teacherApi = {
  list: async (params?: { branch?: string; pageRowCount?: number }) => {
    const q = new URLSearchParams();
    if (params?.branch) q.set('branch', params.branch);
    if (params?.pageRowCount) q.set('pageRowCount', String(params.pageRowCount));
    return req<OdrListResponse<TeacherProfileItem>>('teacherprofile-api', `/v1/teacherprofiles?${q}`);
  },

  get: async (id: string) => {
    return req<OdrItemResponse<TeacherProfileItem>>('teacherprofile-api', `/v1/teacherprofiles/${id}`);
  },

  getReviews: async (teacherId: string) => {
    return req<OdrListResponse<TeacherReviewItem>>('teacherprofile-api', `/v1/teacherreviews?teacherId=${teacherId}`);
  },
};

// ---- Lesson Booking ----

export const bookingApi = {
  list: async () => {
    return req<OdrListResponse<BookingItem>>('lessonbooking-api', '/v1/lessonbookings');
  },

  getSlots: async (teacherId: string) => {
    return req<OdrListResponse<CalendarSlot>>('lessonbooking-api', `/v1/calendarslots?teacherId=${teacherId}&isBooked=false`);
  },

  book: async (params: BookingPayload) => {
    return req<OdrItemResponse<BookingItem>>('lessonbooking-api', '/v1/lessonbooking', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// ---- Q&A ----

export const qaApi = {
  listQuestions: async (params?: { pageRowCount?: number }) => {
    const q = new URLSearchParams({ status: 'approved' });
    if (params?.pageRowCount) q.set('pageRowCount', String(params.pageRowCount));
    return req<OdrListResponse<QuestionItem>>('qaplatform-api', `/v1/questions?${q}`);
  },

  submitQuestion: async (params: { content: string; branch: string; examType: string; status: string }) => {
    return req<OdrItemResponse<QuestionItem>>('qaplatform-api', '/v1/question', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// ---- Types ----

export interface OdrSession {
  userId: string;
  email: string;
  fullname: string;
  roleId: string;
  avatar?: string;
}

export interface OdrListResponse<T> {
  status: string;
  rowCount: number;
  [key: string]: T[] | number | string | undefined;
}

export interface OdrItemResponse<T> {
  status: string;
  [key: string]: T | string | undefined;
}

export interface TeacherProfileItem {
  id: string;
  teacherId: string;
  branches: string;
  description: string;
  qualifications: string;
  hourlyRates: Record<string, number>;
  verificationStatus: string;
  profileStats?: {
    avgRating: number;
    totalReviews: number;
    lessonsGiven: number;
    questionsSolved: number;
  };
  teacherId_data?: {
    fullname: string;
    avatar: string;
    email: string;
  };
}

export interface TeacherReviewItem {
  id: string;
  teacherId: string;
  studentId: string;
  rating: number;
  comment: string;
  published: boolean;
  createdAt?: string;
  studentId_data?: { fullname: string };
}

export interface BookingItem {
  id: string;
  teacherId: string;
  studentId: string;
  lessonDate: string;
  startTime: string;
  endTime: string;
  bookingStatus: string;
  paymentStatus: string;
  pricePerLesson: number;
  teacherId_data?: { fullname: string; avatar: string };
}

export interface CalendarSlot {
  id: string;
  teacherId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface BookingPayload {
  teacherId: string;
  studentId: string;
  lessonType: string;
  lessonDate: string;
  startTime: string;
  endTime: string;
  pricePerLesson: number;
  packageSize: number;
  bookedCount: number;
  bookingStatus: string;
  paymentStatus: string;
  calendarSlotId?: string;
}

export interface QuestionItem {
  id: string;
  studentId: string;
  content: string;
  attachments?: string;
  branch: string;
  examType: string;
  status: string;
  answerCount: number;
  publishedAt?: string;
  studentId_data?: { fullname: string; avatar: string };
}

// ---- Helpers ----

export function getFirstRate(hourlyRates?: Record<string, number>): number {
  if (!hourlyRates) return 0;
  const vals = Object.values(hourlyRates);
  return vals[0] ?? 0;
}

export function normalizeTeacher(t: TeacherProfileItem) {
  return {
    id: t.id,
    name: t.teacherId_data?.fullname ?? 'Öğretmen',
    subject: t.branches ?? '',
    rating: t.profileStats?.avgRating ?? 0,
    reviewCount: t.profileStats?.totalReviews ?? 0,
    price: getFirstRate(t.hourlyRates),
    avatar: t.teacherId_data?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(t.teacherId_data?.fullname ?? 'T')}&background=6366f1&color=fff`,
    online: false,
    teacherId: t.teacherId,
    description: t.description,
    qualifications: t.qualifications,
    lessonsGiven: t.profileStats?.lessonsGiven ?? 0,
    questionsSolved: t.profileStats?.questionsSolved ?? 0,
  };
}
