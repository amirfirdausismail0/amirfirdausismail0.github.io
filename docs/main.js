import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, set, query, limitToLast } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
// Sensor Text Elements
const tempElement = document.getElementById("temperature_text");
const humElement = document.getElementById("humidity_text");
const co2Element = document.getElementById("co2_text");
const lightElement = document.getElementById("light_text");
const updatedElement = document.getElementById("last_updated");

// Energy Savings Elements
const savedElement = document.getElementById("saved_text");
const usedElement = document.getElementById("used_text");

// Manual Switches
const fanSwitch = document.getElementById("btn-fan");
const lightSwitch = document.getElementById("btn-light");

// Table Body
const logTableBody = document.getElementById("log_table_body");

// ==========================================
// 3. HOURLY CHART SETUP (BAR CHART)
// ==========================================
const ctx = document.getElementById('energyBarChart').getContext('2d');

const energyBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
        // Labels for 24 Hours (00 to 23)
        labels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", 
                 "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
        datasets: [{
            label: 'Energy Consumed (Wh)',
            data: new Array(24).fill(0), // Initialize with zeros
            backgroundColor: 'rgba(54, 162, 235, 0.7)', // Blue Bars
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            borderRadius: 4 // Rounded top corners
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.raw.toFixed(2) + ' Wh';
                    }
                }
            }
        },
        scales: {
            y: { 
                beginAtZero: true, 
                title: { display: true, text: 'Watt-hours (Wh)' } 
            },
            x: { 
                title: { display: true, text: 'Hour of Day' },
                grid: { display: false }
            }
        }
    }
});

// Helper Function: Get Today's Date (YYYY-MM-DD) for fetching history
function getTodayDateString() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

// ==========================================
// 4. LISTEN FOR LIVE UPDATES (REAL-TIME)
// ==========================================
const statusRef = ref(database, 'Classroom/Status/');

onValue(statusRef, (snapshot) => {
    const data = snapshot.val();
    
    if (data) {
        // Update Sensor Cards
        tempElement.innerHTML = (data.temperature !== undefined ? data.temperature : "--") + "°C";
        humElement.innerHTML = (data.humidity !== undefined ? data.humidity : "--") + "%";
        co2Element.innerHTML = (data.air_quality !== undefined ? data.air_quality : "--");
        lightElement.innerHTML = (data.lighting !== undefined ? data.lighting : "--");
        updatedElement.innerHTML = data.updated || "Unknown";

        // Update Eco-Efficiency Text
        if (data.energy_saved !== undefined) {
            savedElement.innerText = parseFloat(data.energy_saved).toFixed(2);
        }
        if (data.energy_used !== undefined) {
            usedElement.innerText = parseFloat(data.energy_used).toFixed(2) + " Wh";
        }
    }
});

// ==========================================
// 5. LISTEN FOR CHART & TABLE HISTORY
// ==========================================
// We fetch data from: Classroom/EnergyHistory/2026-01-14 (Dynamic Date)
const todayStr = getTodayDateString();
const historyRef = ref(database, 'Classroom/EnergyHistory/' + todayStr);

onValue(historyRef, (snapshot) => {
    const data = snapshot.val();
    
    // Reset chart data array to zeros
    const hourlyTotals = new Array(24).fill(0);
    const tableRows = [];

    if (data) {
        // Iterate through all logs for today
        Object.values(data).forEach(log => {
            if (log.time && log.wh) {
                // 1. Process Chart Data
                // Extract Hour from "HH:MM:SS" (e.g., "14:30:00" -> 14)
                const hourIndex = parseInt(log.time.split(':')[0]);
                
                if (hourIndex >= 0 && hourIndex < 24) {
                    hourlyTotals[hourIndex] += parseFloat(log.wh);
                }

                // 2. Prepare Table Row Data
                tableRows.push(log);
            }
        });

        // UPDATE CHART
        energyBarChart.data.datasets[0].data = hourlyTotals;
        energyBarChart.update();

        // UPDATE TABLE (Show Last 10 Entries)
        // Reverse to show newest first, take top 10
        const recentLogs = tableRows.reverse().slice(0, 10);
        
        logTableBody.innerHTML = ""; // Clear existing rows
        
        recentLogs.forEach(log => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${log.time || "--"}</td>
                <td>${log.temp !== undefined ? log.temp + "°C" : "--"}</td>
                <td>${log.hum !== undefined ? log.hum + "%" : "--"}</td>
                <td class="fw-bold text-success">${parseFloat(log.wh).toFixed(2)} Wh</td>
            `;
            logTableBody.appendChild(row);
        });

    } else {
        // Handle empty data
        logTableBody.innerHTML = `<tr><td colspan="4" class="text-muted">No energy data recorded yet today.</td></tr>`;
        energyBarChart.data.datasets[0].data = new Array(24).fill(0);
        energyBarChart.update();
    }
});

// ==========================================
// 6. CONTROL SWITCHES (SYNC & WRITE)
// ==========================================
const controlRef = ref(database, 'Classroom/Control/');

// Sync Switch State from Firebase (If page refreshes)
onValue(controlRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        if (fanSwitch) fanSwitch.checked = (data.fan === true);
        if (lightSwitch) lightSwitch.checked = (data.light === true);
    }
});

// Write Fan State
fanSwitch.addEventListener('change', (e) => {
    set(ref(database, 'Classroom/Control/fan'), e.target.checked)
        .catch((err) => { 
            console.error("Error setting fan:", err);
            e.target.checked = !e.target.checked; // Revert if failed
        });
});

// Write Light State
lightSwitch.addEventListener('change', (e) => {
    set(ref(database, 'Classroom/Control/light'), e.target.checked)
        .catch((err) => { 
            console.error("Error setting light:", err);
            e.target.checked = !e.target.checked; // Revert if failed
        });
});
