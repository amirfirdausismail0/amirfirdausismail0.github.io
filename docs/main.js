// ==========================================
// 1. INITIALIZATION & SAFETY CHECK
// ==========================================
// We wait for the window to load to ensure libraries are ready
window.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase === 'undefined' || typeof Chart === 'undefined') {
        console.error("CRITICAL ERROR: Libraries not loaded. Check your internet.");
        alert("Error: Firebase or Chart.js failed to load. Please check your internet connection.");
        return;
    }
    startApp();
});

function startApp() {
    console.log("App Starting...");

    // ==========================================
    // 2. FIREBASE CONFIGURATION
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

    // Initialize Firebase (Compat Mode)
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // ==========================================
    // 3. DOM ELEMENTS
    // ==========================================
    const tempElement = document.getElementById("temperature_text");
    const humElement = document.getElementById("humidity_text");
    const co2Element = document.getElementById("co2_text");
    const lightElement = document.getElementById("light_text");
    const updatedElement = document.getElementById("last_updated");
    
    const savedElement = document.getElementById("saved_text");
    const usedElement = document.getElementById("used_text");
    
    const fanSwitch = document.getElementById("btn-fan");
    const lightSwitch = document.getElementById("btn-light");

    // ==========================================
    // 4. CHART SETUP (HOURLY ENERGY)
    // ==========================================
    const ctx = document.getElementById('energyBarChart').getContext('2d');
    
    const energyBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", 
                     "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"],
            datasets: [{
                label: 'Energy (Wh)',
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
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Wh' } },
                x: { title: { display: true, text: 'Hour' }, grid: { display: false } }
            }
        }
    });

    // Helper: Get Today's Date String
    function getTodayDateString() {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    // ==========================================
    // 5. LIVE SENSOR UPDATES
    // ==========================================
    const statusRef = database.ref('Classroom/Status/');
    
    statusRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Update Sensor Cards
            if (tempElement) tempElement.innerText = (data.temperature !== undefined ? data.temperature : "--") + "°C";
            if (humElement) humElement.innerText = (data.humidity !== undefined ? data.humidity : "--") + "%";
            if (co2Element) co2Element.innerText = (data.air_quality !== undefined ? data.air_quality : "--");
            if (lightElement) lightElement.innerText = (data.lighting !== undefined ? data.lighting : "--");
            if (updatedElement) updatedElement.innerText = data.updated || "Unknown";

            // Update Eco Tracker
            if (data.energy_saved !== undefined && savedElement) {
                savedElement.innerText = parseFloat(data.energy_saved).toFixed(2);
            }
            if (data.energy_used !== undefined && usedElement) {
                usedElement.innerText = parseFloat(data.energy_used).toFixed(2) + " Wh";
            }
        }
    });

    // ==========================================
    // 6. GRAPH HISTORY UPDATES
    // ==========================================
    const todayStr = getTodayDateString();
    const historyRef = database.ref('Classroom/EnergyHistory/' + todayStr);

    historyRef.on('value', (snapshot) => {
        const data = snapshot.val();
        const hourlyTotals = new Array(24).fill(0);

        if (data) {
            Object.values(data).forEach(log => {
                if (log.time && log.wh) {
                    // Extract Hour from "14:30:00" -> 14
                    const hourIndex = parseInt(log.time.split(':')[0]);
                    if (hourIndex >= 0 && hourIndex < 24) {
                        hourlyTotals[hourIndex] += parseFloat(log.wh);
                    }
                }
            });
        }
        
        // Update Chart
        energyBarChart.data.datasets[0].data = hourlyTotals;
        energyBarChart.update();
    });

    // ==========================================
    // 7. MANUAL CONTROLS
    // ==========================================
    const controlRef = database.ref('Classroom/Control/');

    // READ (Sync switch position)
    controlRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            if (fanSwitch) fanSwitch.checked = (data.fan === true);
            if (lightSwitch) lightSwitch.checked = (data.light === true);
        }
    });

    // WRITE (Send command)
    if (fanSwitch) {
        fanSwitch.addEventListener('change', (e) => {
            controlRef.update({ fan: e.target.checked })
                .catch((err) => { 
                    console.error(err); 
                    e.target.checked = !e.target.checked; // Revert if fail
                });
        });
    }

    if (lightSwitch) {
        lightSwitch.addEventListener('change', (e) => {
            controlRef.update({ light: e.target.checked })
                .catch((err) => { 
                    console.error(err); 
                    e.target.checked = !e.target.checked; // Revert if fail
                });
        });
    }
}
