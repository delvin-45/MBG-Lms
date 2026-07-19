import http from 'k6/http';
import { check, sleep } from 'k6';

// Konfigurasi Test (Skenario)
export const options = {
  stages: [
    { duration: '10s', target: 100 }, // Fase Pemanasan: Naik perlahan dari 0 ke 100 user dalam 10 detik
    { duration: '30s', target: 100 }, // Fase Stress: Menahan beban konstan 100 user secara bersamaan selama 30 detik
    { duration: '10s', target: 0 },   // Fase Pendinginan: Turun perlahan menjadi 0 user
  ],
};


const BASE_URL = 'http://localhost:8080/api/v1'; // Pastikan port backend benar (contoh: 5000 atau 8080)
const STUDENT_EMAIL = 'ganjar@mbg.com';        // Ganti dengan email student yang ada di database lokal Anda
const STUDENT_PASSWORD = 'anjayy';          // Ganti dengan passwordnya

export default function () {
  // ----------------------------------------------------
  // 1. POST /auth/login (Login)
  // ----------------------------------------------------
  const loginPayload = JSON.stringify({
    email: STUDENT_EMAIL,
    password: STUDENT_PASSWORD,
  });

  const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  // Memastikan login berhasil
  check(loginRes, {
    'Login berhasil (status 200)': (r) => r.status === 200,
  });

  // Jika login gagal, hentikan siklus user ini
  if (loginRes.status !== 200) {
    sleep(1); 
    return;
  }

  const tokens = loginRes.json('data');
  const accessToken = tokens.accessToken;
  const refreshToken = tokens.refreshToken;

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  // ----------------------------------------------------
  // 2. GET /users/profile (Cek Identitas)
  // ----------------------------------------------------
  http.get(`${BASE_URL}/users/profile`, authHeaders);

  // ----------------------------------------------------
  // 3. GET /courses (Ambil Daftar Kelas)
  // ----------------------------------------------------
  const coursesRes = http.get(`${BASE_URL}/courses`, authHeaders);

  // Mencoba mengambil ID Course pertama secara dinamis dari API
  let courseId = '';
  if (coursesRes.status === 200) {
    const coursesData = coursesRes.json('data');
    if (coursesData && coursesData.length > 0) {
      courseId = coursesData[0].id; // Ambil course pertama
    }
  }

  // Jika murid terdaftar dalam sebuah course, jalankan proses selanjutnya
  if (courseId) {
    // ----------------------------------------------------
    // 4. GET /courses/{id} (Detail Course)
    // ----------------------------------------------------
    http.get(`${BASE_URL}/courses/${courseId}`, authHeaders);

    // ----------------------------------------------------
    // 5. GET /courses/{id}/materials (Daftar Materi)
    // ----------------------------------------------------
    http.get(`${BASE_URL}/courses/${courseId}/materials`, authHeaders);

    // ----------------------------------------------------
    // 6. GET /courses/{id}/assignments (Daftar Tugas)
    // ----------------------------------------------------
    const assignmentsRes = http.get(`${BASE_URL}/courses/${courseId}/assignments`, authHeaders);

    let assignmentId = '';
    if (assignmentsRes.status === 200) {
      const assignmentsData = assignmentsRes.json('data');
      if (assignmentsData && assignmentsData.length > 0) {
        assignmentId = assignmentsData[0].id;
      }
    }

    if (assignmentId) {
      // ----------------------------------------------------
      // 7. POST /assignments/{id}/submit (Kumpul Tugas - File Upload)
      // ----------------------------------------------------
      const uploadData = {
        file: http.file('Halo, ini simulasi file PDF dari K6', 'simulasi-tugas.pdf', 'application/pdf'),
        note: 'Tugas ini disubmit dari mesin stress test K6',
      };

      http.post(`${BASE_URL}/assignments/${assignmentId}/submit`, uploadData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Perhatikan: Content-Type tidak di-set secara manual karena K6 akan otomatis membungkusnya sebagai multipart/form-data
        },
      });
    }

    // ----------------------------------------------------
    // 8. GET /progress/course/{courseId} (Progress Khusus Guru)
    // ----------------------------------------------------
    // Catatan: Karena kita login pakai akun murid, ini kemungkinan akan mereturn 403 Forbidden.
    // Tapi tidak apa-apa, tujuan kita memanggilnya adalah untuk memberikan 'stress' pada router dan middleware backend.
    http.get(`${BASE_URL}/progress/course/${courseId}`, authHeaders);
  }

  // ----------------------------------------------------
  // 9. GET /progress/me (Laporan Progress Murid)
  // ----------------------------------------------------
  http.get(`${BASE_URL}/progress/me`, authHeaders);

  // ----------------------------------------------------
  // 10. POST /auth/refresh-token (Perpanjang Sesi)
  // ----------------------------------------------------
  const refreshPayload = JSON.stringify({ refreshToken: refreshToken });
  http.post(`${BASE_URL}/auth/refresh-token`, refreshPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  // Jeda 1 detik agar simulasi seperti manusia asli (tidak men-spam mesin secara brutal dalam mili-detik)
  sleep(1);
}
