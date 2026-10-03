// Shared pure validators; no device APIs are needed to test them.
const email = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const mobile = value => /^07\d{8}$/.test(value.replace(/\s/g, ''));
const password = value => value.length >= 8 && /[A-Za-z]/.test(value) && /\d/.test(value);
const description = value => value.trim().length >= 10 && value.trim().length <= 500;
module.exports = { email, mobile, password, description };
