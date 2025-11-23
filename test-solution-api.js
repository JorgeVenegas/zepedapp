// Quick test script to check if the solutions API is working
const testPatternId = process.argv[2];

if (!testPatternId) {
  console.log('Usage: node test-solution-api.js <pattern-id>');
  process.exit(1);
}

console.log('Testing solutions API for pattern:', testPatternId);
console.log('URL:', `http://localhost:3000/api/patterns/${testPatternId}/solutions`);
console.log('\nMake sure your dev server is running!');
console.log('You can test manually with:');
console.log(`curl -X POST http://localhost:3000/api/patterns/${testPatternId}/solutions`);
