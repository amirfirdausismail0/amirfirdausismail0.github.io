import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, query, limitToLast, orderByKey } 
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
const logTableBody = document.getElementById("log_table_body");

// ================= 1. HOURLY CHART SETUP =================
const ctx = document.getElementById('energyBarChart').getContext('2d');

const energyBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", 
                 "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
        datasets: [{
            label: 'Energy Used (Wh)',
            data: new Array(24).fill(0), 
            backgroundColor: 'rgba(54, 162, 235, 0.6)', 
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            borderRadius: 3
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
            x: { title: { display: true, text: 'Hour of Day' } }
        }
    }
});

// Helper: Get Today's Date in YYYY-MM-DD format
function getTodayDateString() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// ================= 2. LIVE STATUS UPDATES =================
const statusRef = ref(database, 'Classroom/Status/');
onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        tempElement.innerHTML = (data.temperature !== undefined ? data.temperature : "--") + "°C";
        humElement.innerHTML = (data.humidity !== undefined ? data.humidity : "--") + "%";
        co2Element.innerHTML = (data.air_quality !== undefined ? data.air_quality : "--");
        lightElement.innerHTML = (data.lighting !== undefined ? data.lighting : "--");
        updatedElement.innerHTML = data.updated || "Unknown";
        
        // Eco Savings Updates
        if (data.energy_saved !== undefined) {
            savedElement.innerText = parseFloat(data.energy_saved).toFixed(2);
        }
        if (data.energy_used !== undefined) {
            usedElement.innerText = parseFloat(data.energy_used).toFixed(2) + " Wh";
        }
    }
});

// ================= 3. CHART HISTORY UPDATE =================
const todayStr = getTodayDateString();
const historyRef = ref(database, 'Classroom/EnergyHistory/' + todayStr);

onValue(historyRef, (snapshot) => {
    const data = snapshot.val();
    const hourlyTotals = new Array(24).fill(0);

    if (data) {
        Object.values(data).forEach(log => {
            if (log.time && log.wh) {
                // Parse "14:30:00" -> 14
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

// ================= 4. DATA LOG TABLE =================
const recentLogsQuery = query(ref(database, 'Classroom/EnergyHistory/' + todayStr), limitToLast(10));

onValue(recentLogsQuery, (snapshot) => {
    const data = snapshot.val();
    logTableBody.innerHTML = "";
    
    if (data) {
        const rows = Object.values(data).reverse(); // Newest first
        rows.forEach(log => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${log.time || "--"}</td>
                <td>${log.temp !== undefined ? log.temp + "°C" : "--"}</td>
                <td>${log.hum !== undefined ? log.hum + "%" : "--"}</td>
                <td class="fw-bold text-success">${log.wh ? parseFloat(log.wh).toFixed(2) + " Wh" : "--"}</td>
            `;
            logTableBody.appendChild(row);
        });
    } else {
        logTableBody.innerHTML = `<tr><td colspan="4">No logs found for today.</td></tr>`;
    }
});

// ================= 5. MANUAL CONTROLS =================
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
