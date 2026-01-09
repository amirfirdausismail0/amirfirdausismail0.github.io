import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, set, push, query, limitToLast } from "firebase/database";

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


initializeApp(firebaseConfig);

const db = getDatabase();

//////////////////////////////////V2////////////////////////////////////////////////////////

const temperature_text = document.getElementById('temperature_text');
const humidity_text = document.getElementById('humidity_text');
const co2_text = document.getElementById('co2_text');
const light_text = document.getElementById('light_text');
const last_updated_text = document.getElementById('last_updated');

const monitor_reference = ref(db, 'Classroom/Status/');

onValue(monitor_reference, (snapshot) => {

    let my_object = snapshot.val();

    temperature_text.innerHTML = my_object.temperature + '°C';
    humidity_text.innerHTML = my_object.humidity + '%';
    co2_text.innerHTML = my_object.air_quality;
    light_text.innerHTML = my_object.lighting;
    last_updated_text.innerHTML = my_object.updated;

});