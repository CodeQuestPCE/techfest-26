// Quick test to verify environment variables
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

// Test URL construction
const testPath = '/uploads/test.jpg';
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';

console.log('\nWith NEXT_PUBLIC_API_URL:', apiUrl + testPath);
console.log('With NEXT_PUBLIC_BASE_URL:', baseUrl + testPath);
console.log('\nCorrect URL should be:', 'http://localhost:5000' + testPath);
