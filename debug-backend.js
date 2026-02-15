import axios from 'axios';

// Try to find the port from the file or default to 3001
const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

console.log(`Testing Backend at ${BASE_URL}...`);

const testSearch = async () => {
    try {
        const payload = {
            originLocationCode: 'MUC',
            destinationLocationCode: 'IST',
            departureDate: '2026-02-14', // The problematic date
            adults: 1,
            currencyCode: 'EUR'
        };

        console.log('Sending search request:', payload);

        const response = await axios.post(`${BASE_URL}/api/amadeus/search`, payload);

        console.log('✅ Response Status:', response.status);
        console.log('✅ Response Data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        if (error.response) {
            console.log('❌ CSS/Server Error:', error.response.status, error.response.data);
        } else {
            console.log('❌ Network/Client Error:', error.message);
        }
    }
};

testSearch();
