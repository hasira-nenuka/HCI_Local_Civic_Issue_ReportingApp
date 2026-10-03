const { test } = require('node:test');
const assert = require('node:assert/strict');
const validation = require('../src/utils/validation.cjs');
test('email rejects malformed addresses and accepts trimmed email', () => {
  assert.equal(validation.email(' citizen@demo.lk '), true);
  for (const value of ['hello', '@demo.lk', 'a@', 'a b@demo.lk']) assert.equal(validation.email(value), false);
});
test('mobile validates Sri Lankan ten-digit numbers', () => {
  assert.equal(validation.mobile('071 234 5678'), true);
  for (const value of ['0112345678', '071234567', '07123456789', '07abcdef12']) assert.equal(validation.mobile(value), false);
});
test('password requires length, a letter and a number', () => {
  assert.equal(validation.password('Citizen123'), true);
  for (const value of ['Abc123', '12345678', 'abcdefgh']) assert.equal(validation.password(value), false);
});
test('description enforces trimmed boundaries', () => {
  assert.equal(validation.description('a'.repeat(10)), true);
  assert.equal(validation.description('a'.repeat(500)), true);
  assert.equal(validation.description('a'.repeat(9)), false);
  assert.equal(validation.description('a'.repeat(501)), false);
  assert.equal(validation.description('          '), false);
});
