import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL =
  __ENV.BASE_URL || "http://host.docker.internal:8080/api/v1";

const EMAIL = __ENV.EMAIL || "ganjar@mbg.com";
const PASSWORD = __ENV.PASSWORD || "anjayy";

export const options = {
  scenarios: {
    stress_test: {
      executor: "ramping-vus",
      startVUs: 0,

      stages: [
        { duration: "10s", target: 10 },
        { duration: "10s", target: 25 },
        { duration: "10s", target: 50 },
        { duration: "10s", target: 100 },
        { duration: "10s", target: 100 },
        { duration: "10s", target: 0 },
      ],

      gracefulRampDown: "10s",
      gracefulStop: "10s",
    },
  },

  thresholds: {
    checks: ["rate>0.99"],
    http_req_failed: ["rate<0.01"],

    http_req_duration: [
      "p(95)<500",
      "p(99)<1000",
    ],

    "http_req_duration{name:health}": [
      "p(95)<300",
    ],

    "http_req_duration{name:courses}": [
      "p(95)<700",
    ],
  },
};

export function setup() {
  const loginResponse = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: EMAIL,
      password: PASSWORD,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
      tags: {
        name: "login_setup",
      },
    }
  );

  const loginValid = check(loginResponse, {
    "setup login returns HTTP 200": (response) =>
      response.status === 200,

    "setup login returns access token": (response) =>
      Boolean(response.json("data.accessToken")),
  });

  if (!loginValid) {
    throw new Error(
      `Setup login failed. HTTP ${loginResponse.status}: ${loginResponse.body}`
    );
  }

  return {
    token: loginResponse.json("data.accessToken"),
  };
}

export default function (data) {
  const healthResponse = http.get(
    `${BASE_URL}/health`,
    {
      tags: {
        name: "health",
      },
    }
  );

  check(healthResponse, {
    "health returns HTTP 200": (response) =>
      response.status === 200,
  });

  const coursesResponse = http.get(
    `${BASE_URL}/courses?page=1&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
      tags: {
        name: "courses",
      },
    }
  );

  check(coursesResponse, {
    "courses returns HTTP 200": (response) =>
      response.status === 200,

    "courses response is JSON": (response) =>
      (response.headers["Content-Type"] || "")
        .includes("application/json"),
  });

  sleep(1);
}