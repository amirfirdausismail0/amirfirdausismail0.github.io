// Import Firebase SDKs from the CDN
// (This replaces the thousands of lines of library code in your old file)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// 1. Firebase Configuration
// (Extracted from your minified code)
const firebaseConfig = {
    apiKey: "AIzaSyD_htAAKN1dv7fsOkO0g8IxgQRsDuIiyu4",
    authDomain: "rfid-attendance-30745.firebaseapp.com",
    databaseURL: "https://rfid-attendance-30745-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "rfid-attendance-30745",
    storageBucket: "rfid-attendance-30745.firebasestorage.app",
    messagingSenderId: "860028054162",
    appId: "1:860028054162:web:f3b05e9a5c6733bae0944b",
    measurementId: "G-XMZEQML8B9"
};

// 2. Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 3. DOM Elements Selection
const tempElement = document.getElementById("temperature_text");
const humElement = document.getElementById("humidity_text");
const co2Element = document.getElementById("co2_text");
const lightElement = document.getElementById("light_text");
const updatedElement = document.getElementById("last_updated");

// 4. Main Logic: Listen for Realtime Updates
const statusRef = ref(database, 'Classroom/Status/');

console.log("Listening for database updates...");

onValue(statusRef, (snapshot) => {
    const data = snapshot.val();

    if (data) {
        // Update HTML elements with data from Firebase
        // Note: We use optional chaining (?.) to prevent errors if a field is missing
        tempElement.innerHTML = (data.temperature || "--") + "°C";
        humElement.innerHTML = (data.humidity || "--") + "%";
        
        // These rely on the ESP32 fix mentioned previously!
        co2Element.innerHTML = data.air_quality || "--"; 
        lightElement.innerHTML = data.lighting || "--";
        
        updatedElement.innerHTML = data.updated || "Unknown";
    } else {
        console.log("No data available at /Classroom/Status/");
    }
}, (error) => {
    console.error("Database Error:", error);
});