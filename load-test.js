// Example load test script for k6
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp up to 50 users over 30 seconds
    { duration: '1m', target: 100 },   // Stay at 100 users for 1 minute
    { duration: '30s', target: 200 },  // Spike to 200 users
    { duration: '1m', target: 100 },   // Back to 100 users
    { duration: '30s', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.05'],    // Error rate should be less than 5%
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Test scenario: Mixed endpoint requests
  let endpoints = [
    '/api/fast',
    '/api/slow', 
    '/api/cpu-intensive',
    '/api/memory-intensive',
  ];

  // Randomly select endpoint
  let endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  let response = http.get(`${BASE_URL}${endpoint}`);

  // Check response
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  // Occasionally test error endpoint
  if (Math.random() < 0.1) {
    http.get(`${BASE_URL}/api/error`);
  }

  // Occasionally test POST endpoint
  if (Math.random() < 0.2) {
    http.post(`${BASE_URL}/api/orders`, JSON.stringify({}), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  sleep(1);
}
