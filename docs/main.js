import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const savedElement = document.getElementById("saved_text");
const usedElement = document.getElementById("used_text");

const fanSwitch = document.getElementById("btn-fan");
const lightSwitch = document.getElementById("btn-light");

// ================= CHART SETUP =================
const ctx = document.getElementById('energyBarChart').getContext('2d');

const energyBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", 
                 "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
        datasets: [{
            label: 'Energy Consumed (Wh)',
            data: new Array(24).fill(0), 
            backgroundColor: 'rgba(54, 162, 235, 0.7)', 
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            borderRadius: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Watt-hours (Wh)' } },
            x: { title: { display: true, text: 'Hour of Day' }, grid: { display: false } }
        }
    }
});

function getTodayDateString() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// ================= 1. LIVE STATUS (ECO TRACKER) =================
// This section ensures the Eco Tracker continues to work
const statusRef = ref(database, 'Classroom/Status/');

onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        tempElement.innerHTML = (data.temperature !== undefined ? data.temperature : "--") + "°C";
        humElement.innerHTML = (data.humidity !== undefined ? data.humidity : "--") + "%";
        co2Element.innerHTML = (data.air_quality !== undefined ? data.air_quality : "--");
        lightElement.innerHTML = (data.lighting !== undefined ? data.lighting : "--");
        updatedElement.innerHTML = data.updated || "Unknown";

        // >>> THIS IS THE ECO TRACKER LOGIC <<<
        // It comes from Status, so it is safe even without the Log Table.
        if (data.energy_saved !== undefined) {
            savedElement.innerText = parseFloat(data.energy_saved).toFixed(2);
        }
        if (data.energy_used !== undefined) {
            usedElement.innerText = parseFloat(data.energy_used).toFixed(2) + " Wh";
        }
    }
});

// ================= 2. GRAPH HISTORY =================
// This fetches data only for the graph (Table logic removed)
const todayStr = getTodayDateString();
const historyRef = ref(database, 'Classroom/EnergyHistory/' + todayStr);

onValue(historyRef, (snapshot) => {
    const data = snapshot.val();
    const hourlyTotals = new Array(24).fill(0);

    if (data) {
        Object.values(data).forEach(log => {
            if (log.time && log.wh) {
                const hourIndex = parseInt(log.time.split(':')[0]);
                if (hourIndex >= 0 && hourIndex < 24) {
                    hourlyTotals[hourIndex] += parseFloat(log.wh);
                }
            }
        });
    }
    energyBarChart.data.datasets[0].data = hourlyTotals;
    energyBarChart.update();
});

// ================= 3. MANUAL CONTROLS =================
const controlRef = ref(database, 'Classroom/Control/');
onValue(controlRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        if (fanSwitch) fanSwitch.checked = (data.fan === true);
        if (lightSwitch) lightSwitch.checked = (data.light === true);
    }
});

fanSwitch.addEventListener('change', (e) => {
    set(ref(database, 'Classroom/Control/fan'), e.target.checked).catch(() => { e.target.checked = !e.target.checked; });
});

lightSwitch.addEventListener('change', (e) => {
    set(ref(database, 'Classroom/Control/light'), e.target.checked).catch(() => { e.target.checked = !e.target.checked; });
});
