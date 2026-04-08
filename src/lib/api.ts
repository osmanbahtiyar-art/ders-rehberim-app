const BASE = 'https://odr.prw.mindbricks.com';

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

export class ApiError extends Error {
  errCode: string;
  httpStatus: number;
  constructor(message: string, errCode: string, httpStatus: number) {
    super(message);
    this.errCode = errCode;
    this.httpStatus = httpStatus;
  }
}

/** API hata mesajlarını Türkçe'ye çevirir */
export function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('DuplicateUniqueIndexError') && msg.includes('email')) return 'Bu e-posta adresi zaten kayıtlı.';
  if (msg.includes('DuplicateUniqueIndexError')) return 'Bu bilgiler zaten kullanımda.';
  if (msg.includes('invalid_credentials') || msg.includes('InvalidCredentials')) return 'E-posta veya şifre hatalı.';
  if (msg.includes('EmailVerificationNeeded')) return 'E-posta doğrulaması gerekiyor.';
  if (msg.includes('MobileVerificationNeeded')) return 'Telefon doğrulaması gerekiyor.';
  if (msg.includes('NetworkError') || msg.includes('bağlanılamadı')) return 'Sunucuya bağlanılamadı. Lütfen tekrar deneyin.';
  if (msg.includes('ServerError') || msg.includes('Sunucu hatası')) return 'Sunucu hatası oluştu. Lütfen tekrar deneyin.';
  if (msg.startsWith('errMsg_')) return 'Bir hata oluştu. Lütfen tekrar deneyin.';
  return msg || 'Beklenmeyen bir hata oluştu.';
}

async function parseJSON(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  if (!text || !text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    // HTML hata sayfası veya bozuk yanıt
    console.error('JSON parse hatası, ham yanıt:', text.slice(0, 200));
    if (!res.ok) throw new ApiError(`Sunucu hatası (${res.status})`, 'ServerError', res.status);
    return {};
  }
}

async function req<T>(service: string, path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['odr-access-token'] = token;

  let res: Response;
  try {
    res = await fetch(`${BASE}/${service}${path}`, { ...options, headers });
  } catch (networkErr) {
    throw new ApiError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.', 'NetworkError', 0);
  }

  const newToken = res.headers.get('odr-access-token');
  if (newToken) setToken(newToken);

  const data = await parseJSON(res);
  if (!res.ok) throw new ApiError((data.message as string) || 'API hatası', (data.errCode as string) || '', res.status);
  return data as T;
}

// ---- Auth ----

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    let res: Response;
    try {
      res = await fetch(`${BASE}/auth-api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
    } catch {
      throw new ApiError('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.', 'NetworkError', 0);
    }
    const newToken = res.headers.get('odr-access-token');
    if (newToken) setToken(newToken);
    const data = await parseJSON(res);
    if (!res.ok) throw new ApiError((data.message as string) || 'Giriş başarısız', (data.errCode as string) || '', res.status);
    return data as LoginResponse;
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

  register: async (params: { email: string; password: string; fullname: string }): Promise<RegisterResponse> => {
    return req<RegisterResponse>('auth-api', '/v1/registeruser', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },
};

// ---- Verification ----

export const verificationApi = {
  // Email verification
  emailStart: (email: string) =>
    req<VerificationStartResponse>('auth-api', '/verification-services/email-verification/start', {
      method: 'POST', body: JSON.stringify({ email }),
    }),
  emailComplete: (email: string, secretCode: string) =>
    req<{ status: string; isVerified: boolean; mobileVerificationNeeded?: boolean }>('auth-api', '/verification-services/email-verification/complete', {
      method: 'POST', body: JSON.stringify({ email, secretCode }),
    }),

  // Mobile verification
  mobileStart: (email: string) =>
    req<VerificationStartResponse>('auth-api', '/verification-services/mobile-verification/start', {
      method: 'POST', body: JSON.stringify({ email }),
    }),
  mobileComplete: (email: string, secretCode: string) =>
    req<{ status: string; isVerified: boolean }>('auth-api', '/verification-services/mobile-verification/complete', {
      method: 'POST', body: JSON.stringify({ email, secretCode }),
    }),

  // Password reset by email
  passwordResetEmailStart: (email: string) =>
    req<VerificationStartResponse>('auth-api', '/verification-services/password-reset-by-email/start', {
      method: 'POST', body: JSON.stringify({ email }),
    }),
  passwordResetEmailComplete: (email: string, secretCode: string, password: string) =>
    req<{ status: string; isVerified: boolean }>('auth-api', '/verification-services/password-reset-by-email/complete', {
      method: 'POST', body: JSON.stringify({ email, secretCode, password }),
    }),

  // Password reset by mobile
  passwordResetMobileStart: (email: string) =>
    req<VerificationStartResponse & { mobile?: string }>('auth-api', '/verification-services/password-reset-by-mobile/start', {
      method: 'POST', body: JSON.stringify({ email }),
    }),
  passwordResetMobileComplete: (email: string, secretCode: string, password: string) =>
    req<{ status: string; isVerified: boolean }>('auth-api', '/verification-services/password-reset-by-mobile/complete', {
      method: 'POST', body: JSON.stringify({ email, secretCode, password }),
    }),

  // 2FA Email
  email2FAStart: (userId: string, sessionId: string) =>
    req<VerificationStartResponse>('auth-api', '/verification-services/email-2factor-verification/start', {
      method: 'POST', body: JSON.stringify({ userId, sessionId }),
    }),
  email2FAComplete: (userId: string, sessionId: string, secretCode: string) =>
    req<LoginResponse>('auth-api', '/verification-services/email-2factor-verification/complete', {
      method: 'POST', body: JSON.stringify({ userId, sessionId, secretCode }),
    }),

  // 2FA Mobile
  mobile2FAStart: (userId: string, sessionId: string) =>
    req<VerificationStartResponse>('auth-api', '/verification-services/mobile-2factor-verification/start', {
      method: 'POST', body: JSON.stringify({ userId, sessionId }),
    }),
  mobile2FAComplete: (userId: string, sessionId: string, secretCode: string) =>
    req<LoginResponse>('auth-api', '/verification-services/mobile-2factor-verification/complete', {
      method: 'POST', body: JSON.stringify({ userId, sessionId, secretCode }),
    }),
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

  listPendingQuestions: async (params?: { pageRowCount?: number; branch?: string }) => {
    const q = new URLSearchParams({ status: 'approved' });
    if (params?.pageRowCount) q.set('pageRowCount', String(params.pageRowCount));
    if (params?.branch) q.set('branch', params.branch);
    return req<OdrListResponse<QuestionItem>>('qaplatform-api', `/v1/questions?${q}`);
  },

  submitQuestion: async (params: { content: string; branch: string; examType: string; status: string }) => {
    return req<OdrItemResponse<QuestionItem>>('qaplatform-api', '/v1/question', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  submitAnswer: async (params: { questionId: string; content: string; attachments?: string }) => {
    return req<OdrItemResponse<AnswerItem>>('qaplatform-api', '/v1/answer', {
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
  sessionId?: string;
}

export interface LoginResponse extends OdrSession {
  accessToken?: string;
  sessionNeedsEmail2FA?: boolean;
  sessionNeedsMobile2FA?: boolean;
  emailVerificationNeeded?: boolean;
  mobileVerificationNeeded?: boolean;
}

export interface RegisterResponse {
  status: string;
  emailVerificationNeeded?: boolean;
  mobileVerificationNeeded?: boolean;
  user?: {
    id: string;
    email: string;
    fullname: string;
    roleId: string;
    avatar?: string;
  };
}

export interface VerificationStartResponse {
  status: string;
  codeIndex: number;
  expireTime: number;
  verificationType: string;
  // test mode only
  secretCode?: string;
  userId?: string;
  mobile?: string;
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

export interface AnswerItem {
  id: string;
  questionId: string;
  teacherId: string;
  content: string;
  attachments?: string;
  createdAt?: string;
  teacherId_data?: { fullname: string; avatar: string };
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
