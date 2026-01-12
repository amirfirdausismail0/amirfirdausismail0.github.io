import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ================= FIREBASE CONFIG =================
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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ================= DOM ELEMENTS =================
const tempElement = document.getElementById("temperature_text");
const humElement = document.getElementById("humidity_text");
const co2Element = document.getElementById("co2_text");
const lightElement = document.getElementById("light_text");
const updatedElement = document.getElementById("last_updated");
const savedElement = document.getElementById("saved_text"); // NEW

const fanSwitch = document.getElementById("btn-fan");
const lightSwitch = document.getElementById("btn-light");
const ctx = document.getElementById('powerChart').getContext('2d'); // NEW

// ================= CHART SETUP =================
const powerChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Power (Watts)',
            data: [],
            borderColor: '#198754', // Green Color
            backgroundColor: 'rgba(25, 135, 84, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 2
        }]
    },
    options: {
        responsive: true,
        scales: {
            x: { display: false }, // Hide time labels to keep it clean
            y: { beginAtZero: true, title: { display: true, text: 'Watts' } }
        },
        animation: { duration: 0 } // No animation for smoother real-time feel
    }
});

function addDataToChart(chart, data) {
    const now = new Date();
    const timeLabel = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
    
    chart.data.labels.push(timeLabel);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });

    // Keep last 30 readings
    if (chart.data.labels.length > 30) {
        chart.data.labels.shift();
        chart.data.datasets.forEach((dataset) => {
            dataset.data.shift();
        });
    }
    chart.update();
}

// ================= LISTEN FOR UPDATES =================
const statusRef = ref(database, 'Classroom/Status/');

onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    
    if (data) {
        // 1. Update Standard Sensors
        tempElement.innerHTML = (data.temperature !== undefined ? data.temperature : "--") + "°C";
        humElement.innerHTML = (data.humidity !== undefined ? data.humidity : "--") + "%";
        co2Element.innerHTML = (data.air_quality !== undefined ? data.air_quality : "--");
        lightElement.innerHTML = (data.lighting !== undefined ? data.lighting : "--");
        updatedElement.innerHTML = data.updated || "Unknown";

        // 2. Update Power Chart
        const powerVal = data.power !== undefined ? data.power : 0;
        addDataToChart(powerChart, powerVal);

        // 3. Update Savings Text
        if (data.energy_saved !== undefined) {
            savedElement.innerText = parseFloat(data.energy_saved).toFixed(4) + " Wh";
        }
    }
});

// ================= CONTROL SYNC =================
const controlRef = ref(database, 'Classroom/Control/');
onValue(controlRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        if (fanSwitch) fanSwitch.checked = (data.fan === true);
        if (lightSwitch) lightSwitch.checked = (data.light === true);
    }
});

// ================= BUTTON HANDLERS =================
fanSwitch.addEventListener('change', (e) => {
    set(ref(database, 'Classroom/Control/fan'), e.target.checked)
        .catch((err) => { e.target.checked = !e.target.checked; });
});

lightSwitch.addEventListener('change', (e) => {
    set(ref(database, 'Classroom/Control/light'), e.target.checked)
        .catch((err) => { e.target.checked = !e.target.checked; });
});
