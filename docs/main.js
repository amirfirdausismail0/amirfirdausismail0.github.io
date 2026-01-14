// ==========================================
// 1. INITIALIZATION & SAFETY CHECK
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase === 'undefined' || typeof Chart === 'undefined') {
        console.error("CRITICAL ERROR: Libraries not loaded.");
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
        appId: "1:860028054162:web:f3b05e9a5c6733bae0944b"
    };

    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // ==========================================
    // 3. DOM ELEMENTS
    // ==========================================
    const els = {
        temp: document.getElementById("temperature_text"),
        hum: document.getElementById("humidity_text"),
        co2: document.getElementById("co2_text"),
        light: document.getElementById("light_text"),
        updated: document.getElementById("last_updated"),
        saved: document.getElementById("saved_text"),
        used: document.getElementById("used_text"),
        fanSwitch: document.getElementById("btn-fan"),
        lightSwitch: document.getElementById("btn-light"),
        ctx: document.getElementById('energyBarChart').getContext('2d')
    };

    // ==========================================
    // 4. CHART SETUP (HOURLY ENERGY)
    // ==========================================
    const energyBarChart = new Chart(els.ctx, {
        type: 'bar',
        data: {
            // Hours 00 to 23
            labels: Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')), 
            datasets: [{
                label: 'Energy (Wh)',
                data: new Array(24).fill(0),
                backgroundColor: '#0d6efd', // Bootstrap Primary Blue
                borderRadius: 4,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Wh' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Helper: Get Today's Date String (YYYY-MM-DD) matching ESP32 format
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
            if (els.temp) els.temp.innerText = (data.temperature ? data.temperature.toFixed(1) : "--") + "°C";
            if (els.hum) els.hum.innerText = (data.humidity ? data.humidity.toFixed(1) : "--") + "%";
            if (els.co2) els.co2.innerText = (data.air_quality || "--");
            if (els.light) els.light.innerText = (data.lighting || "--");
            if (els.updated) els.updated.innerText = data.updated || "--";
        }
    });

    // ==========================================
    // 6. ENERGY HISTORY (GRAPH & TOTALS)
    // ==========================================
    const todayStr = getTodayDateString();
    const historyRef = database.ref('Classroom/EnergyHistory/' + todayStr);

    historyRef.on('value', (snapshot) => {
        const data = snapshot.val();
        const hourlyTotals = new Array(24).fill(0);
        let totalDailyWh = 0.0;

        if (data) {
            // Loop through all 10-minute uploads
            Object.values(data).forEach(log => {
                if (log.wh) {
                    const val = parseFloat(log.wh);
                    totalDailyWh += val;

                    // Bin into hours for the chart
                    if (log.time) {
                        const hour = parseInt(log.time.split(':')[0]);
                        if (hour >= 0 && hour < 24) hourlyTotals[hour] += val;
                    }
                }
            });
        }
        
        // A. Update Big "Eco" Numbers
        if (els.used) els.used.innerText = totalDailyWh.toFixed(2) + " Wh";
        
        // Calculate "Saved" (Example: 30% of total)
        // Adjust the math below if you have a specific formula
        const savedValue = totalDailyWh * 0.30; 
        if (els.saved) els.saved.innerText = savedValue.toFixed(2);

        // B. Update Chart
        energyBarChart.data.datasets[0].data = hourlyTotals;
        energyBarChart.update();
    });

    // ==========================================
    // 7. MANUAL CONTROLS
    // ==========================================
    const controlRef = database.ref('Classroom/Control/');

    // READ (Sync switch state)
    controlRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            if (els.fanSwitch) els.fanSwitch.checked = (data.fan === true);
            if (els.lightSwitch) els.lightSwitch.checked = (data.light === true);
        }
    });

    // WRITE (Send command)
    function toggleDevice(device, state) {
        controlRef.update({ [device]: state }).catch(console.error);
    }

    if (els.fanSwitch) {
        els.fanSwitch.addEventListener('change', (e) => toggleDevice('fan', e.target.checked));
    }
    if (els.lightSwitch) {
        els.lightSwitch.addEventListener('change', (e) => toggleDevice('light', e.target.checked));
    }
}
