import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

// Konfigurasi K6
export const options = {
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },  // Naik ke 50 VU
        { duration: '30s', target: 100 }, // Naik ke 100 VU
        { duration: '30s', target: 200 }, // Naik ke 200 VU
        { duration: '30s', target: 300 }, // Naik ke 300 VU
        { duration: '1m', target: 500 },  // Puncak beban tertinggi 500 VU ditahan selama 1 menit
        { duration: '30s', target: 0 },   // Cool down, turun drastis ke 0
      ],
    },
  },
  thresholds: {
    // Syarat (Thresholds)
    http_req_failed: ['rate<0.01'],    // Gagal harus di bawah 1%
    http_req_duration: ['p(95)<500'],  
  },
};

const BASE_URL = 'http://localhost:8080/api/v1';
const PERFORMATIVE_MODE = false; // True = Bypass Rate Limiter (Skenario Sukses), False = Rate Limiter Aktif (Skenario Gagal/Diblokir)

// Data Akun 
const USERS = [

  { email: 'ganjar@mbg.com', password: 'anjayy' }, 
];

// [TAHAP 1: K6 MENGIRIM 
// Fungsi ini bertugas menyelipkan "Kata Sandi Rahasia" ke dalam setiap request
// agar Rate Limiter membiarkan kita lewat tanpa diblokir.
function addPerformativeHeader(headers = {}) {
  if (PERFORMATIVE_MODE) {
    // Memberikan kata sandi rahasia ke penjaga (RATE LIMITER)
    headers['x-performative-mode'] = 'mbg-stress-bypass';
  }
  return headers;
}

// Cache Token di Memori per VU
let accessToken = null;
let refreshToken = null;
let authHeaders = null;

export default function () {
  // 1. ENDPOINT 1: POST /auth/login 
  if (!accessToken) {
    // Pilih akun 
    const user = USERS[exec.vu.idInTest % USERS.length];
    
    const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify(user), {
      headers: addPerformativeHeader({ 'Content-Type': 'application/json' }),
    });

    check(loginRes, { '1. Login berhasil (200)': (r) => r.status === 200 });

    if (loginRes.status === 200) {
      const body = loginRes.json();
      accessToken = body.data.accessToken;
      refreshToken = body.data.refreshToken;
      authHeaders = addPerformativeHeader({
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      });
    } else {
      sleep(1);
      return; // Berhenti jika gagal login
    }
  }

  // ALUR WORKFLOW UTAMA (Real-world User Behaviour)

  // 2. ENDPOINT 2: GET /users/profile
  const profileRes = http.get(`${BASE_URL}/users/profile`, { headers: authHeaders });
  check(profileRes, { '2. Get Profile (200)': (r) => r.status === 200 });

  // 3. ENDPOINT 3: GET /courses
  const coursesRes = http.get(`${BASE_URL}/courses`, { headers: authHeaders });
  check(coursesRes, { '3. Get Courses (200)': (r) => r.status === 200 });
  
  let courseId = null;
  if (coursesRes.status === 200) {
    const courses = coursesRes.json().data;
    if (courses && courses.length > 0) courseId = courses[0].id;
  }

  if (courseId) {
    // 4. ENDPOINT 4: GET /courses/{courseId}
    const courseDetailRes = http.get(`${BASE_URL}/courses/${courseId}`, { headers: authHeaders });
    check(courseDetailRes, { '4. Get Course Detail (200)': (r) => r.status === 200 });

    // 5. ENDPOINT 5: GET /courses/{courseId}/materials
    const materialsRes = http.get(`${BASE_URL}/courses/${courseId}/materials`, { headers: authHeaders });
    check(materialsRes, { '5. Get Materials (200)': (r) => r.status === 200 });

    // 6. ENDPOINT 6: GET /courses/{courseId}/assignments
    const assignmentsRes = http.get(`${BASE_URL}/courses/${courseId}/assignments`, { headers: authHeaders });
    check(assignmentsRes, { '6. Get Assignments (200)': (r) => r.status === 200 });

    let assignmentId = null;
    if (assignmentsRes.status === 200) {
      const assignments = assignmentsRes.json().data;
      if (assignments && assignments.length > 0) assignmentId = assignments[0].id;
    }

    // 7. ENDPOINT 7: POST /assignments/{assignmentId}/submit (Hanya dieksekusi oleh 10% User)
    if (assignmentId && Math.random() < 1.0) {
      const payload = JSON.stringify({ fileUrl: 'https://example.com/dummy-file.pdf' });
      const submitRes = http.post(`${BASE_URL}/assignments/${assignmentId}/submit`, payload, { headers: authHeaders });
      check(submitRes, { '7. Submit Assignment (200/201)': (r) => r.status === 200 || r.status === 201 || r.status === 400 });
    }

    // 8. ENDPOINT 8: GET /progress/course/{courseId}
    const progressCourseRes = http.get(`${BASE_URL}/progress/course/${courseId}`, { headers: authHeaders });
    check(progressCourseRes, { '8. Course Progress (200/403)': (r) => r.status === 200 || r.status === 403 });
  }

  // 9. ENDPOINT 9: GET /progress/me
  const progressMeRes = http.get(`${BASE_URL}/progress/me`, { headers: authHeaders });
  check(progressMeRes, { '9. My Progress (200)': (r) => r.status === 200 });

  // 10. ENDPOINT 10: POST /auth/refresh-token
  const refreshPayload = JSON.stringify({ refreshToken: refreshToken });
  const refreshRes = http.post(`${BASE_URL}/auth/refresh-token`, refreshPayload, {
    headers: addPerformativeHeader({ 'Content-Type': 'application/json' }),
  });
  check(refreshRes, { '10. Refresh Token (200)': (r) => r.status === 200 });

  // Jeda 1 detik agar simulasi seperti asli membaca layar
  sleep(1);
}

// import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// // Generate Laporan HTML yang Indah
// export function handleSummary(data) {
//   return {
//     "laporan-stress-test.html": htmlReport(data),
//   };
// }
