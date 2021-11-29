import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 1000,
  duration: '30s',
};

export default function () {
  http.get('http://localhost:3030/questions?product_id=3');
  sleep(1);
}
