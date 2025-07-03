const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
  try {
    console.log('Testing SkyLedger Zones API...\n');

    // Test blockchain status
    console.log('1. Testing blockchain status...');
    const statusResponse = await fetch(`${BASE_URL}/blockchain/status`);
    const statusData = await statusResponse.json();
    console.log('Blockchain Status:', statusData);
    console.log('');

    // Test getting all zones
    console.log('2. Testing get all zones...');
    const zonesResponse = await fetch(`${BASE_URL}/zones`);
    const zonesData = await zonesResponse.json();
    console.log('All Zones:', zonesData);
    console.log('');

    // Test getting total zones
    console.log('3. Testing total zones count...');
    const totalResponse = await fetch(`${BASE_URL}/zones/stats/total`);
    const totalData = await totalResponse.json();
    console.log('Total Zones:', totalData);
    console.log('');

    console.log('API tests completed successfully!');
  } catch (error) {
    console.error('API test failed:', error.message);
  }
}

testAPI();