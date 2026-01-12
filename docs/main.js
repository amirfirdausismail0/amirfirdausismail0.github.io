import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ==========================================
// 1. FIREBASE CONFIGURATION
// ==========================================
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ==========================================
// 2. DOM ELEMENTS SELECTION
// ==========================================
// Sensor Displays
const tempElement = document.getElementById("temperature_text");
const humElement = document.getElementById("humidity_text");
const co2Element = document.getElementById("co2_text");
const lightElement = document.getElementById("light_text");
const updatedElement = document.getElementById("last_updated");

// Manual Control Switches
const fanSwitch = document.getElementById("btn-fan");
const lightSwitch = document.getElementById("btn-light");

// ==========================================
// 3. LISTEN FOR SENSOR UPDATES (READ)
// ==========================================
const statusRef = ref(database, 'Classroom/Status/');

onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    
    if (data) {
        // Update HTML with sensor data (use "--" if data is missing)
        tempElement.innerHTML = (data.temperature !== undefined ? data.temperature : "--") + "°C";
        humElement.innerHTML = (data.humidity !== undefined ? data.humidity : "--") + "%";
        co2Element.innerHTML = (data.air_quality !== undefined ? data.air_quality : "--");
        lightElement.innerHTML = (data.lighting !== undefined ? data.lighting : "--");
        updatedElement.innerHTML = data.updated || "Unknown";
    } else {
        console.log("No sensor data found.");
    }
}, (error) => {
    console.error("Error reading sensor data:", error);
});

// ==========================================
// 4. LISTEN FOR CONTROL STATE (SYNC)
// ==========================================
// This ensures that if you refresh the page, the buttons show the correct state
const controlRef = ref(database, 'Classroom/Control/');

onValue(controlRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        // Sync button positions with Firebase data
        // If 'fan' is true, switch is checked. If false/null, unchecked.
        if (fanSwitch) fanSwitch.checked = (data.fan === true);
        if (lightSwitch) lightSwitch.checked = (data.light === true);
    }
});

// ==========================================
// 5. HANDLE BUTTON CLICKS (WRITE)
// ==========================================
// Fan Switch Logic
fanSwitch.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    
    // Write true/false to Firebase
    set(ref(database, 'Classroom/Control/fan'), isChecked)
        .then(() => {
            console.log("Fan override set to:", isChecked);
        })
        .catch((error) => {
            console.error("Failed to set fan override:", error);
            // Revert switch if update failed
            e.target.checked = !isChecked;
        });
});

// Light Switch Logic
lightSwitch.addEventListener('change', (e) => {
    const isChecked = e.target.checked;

    // Write true/false to Firebase
    set(ref(database, 'Classroom/Control/light'), isChecked)
        .then(() => {
            console.log("Light override set to:", isChecked);
        })
        .catch((error) => {
            console.error("Failed to set light override:", error);
            // Revert switch if update failed
            e.target.checked = !isChecked;
        });
});