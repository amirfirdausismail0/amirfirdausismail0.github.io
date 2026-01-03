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

// function writeUserData(name, content) {
    
//     const db = getDatabase();

//     const reference = ref(db, 'fake_data/');

//     const pushRef = push(reference)

//     set(pushRef, {

//         username: name,
//         content: content
//     });
// }

//////////////////////////////////V2////////////////////////////////////////////////////////

const temperature_text = document.getElementById('temperature_text');
const humidity_text = document.getElementById('humidity_text');
const co2_text = document.getElementById('co2_text');
const light_text = document.getElementById('light_text');

const monitor_reference = ref(db, 'monitor/');

// const recentTempRef = query(temperature_reference, limitToLast(1));

onValue(monitor_reference, (snapshot) => {

    // snapshot.forEach((childSnapshot) => {

    //     const childKey = childSnapshot.key;
    //     const childData = childSnapshot.val();
    //     // console.log(childData);

    //     // console.log('childKey');
    //     // console.log(childKey);
    //     // console.log('childData');
    //     // console.log(childData);

    //     temperature = childData.temp + '°C';
    //     humidity = childData.humidity + '%';
    //     co2 = childData.air_quality;
    //     light = childData.light_raw;

    //     // console.log(temperature)

    // });

    let my_object = snapshot.val();

    temperature_text.innerHTML = my_object.temp + '°C';
    humidity_text.innerHTML = my_object.humidity + '%';
    co2_text.innerHTML = my_object.air_quality;
    light_text.innerHTML = my_object.light_raw;

});
// , {
//     onlyOnce: true
// });

//////////////////////////////////GET TEMPERATURE/////////////////////////////////////////

// const temperature_text = document.getElementById('temperature_text');

// const temperature_reference = ref(db, 'temperature/');

// const recentTempRef = query(temperature_reference, limitToLast(1));

// onValue(recentTempRef, (snapshot) => {

//     let temperature = '';

//     snapshot.forEach((childSnapshot) => {

//         // const childKey = childSnapshot.key;
//         const childData = childSnapshot.val();

//         // console.log('childKey');
//         // console.log(childKey);
//         // console.log('childData');
//         // console.log(childData);

//         temperature = childData.temp + '°C';
//     });
// });
// , {
//     onlyOnce: true
// });

//////////////////////////////////GET HUMIDITY/////////////////////////////////////////

// const humidity_text = document.getElementById('humidity_text');

// const humidity_reference = ref(db, 'humidity/');

// const recentHumidityRef = query(humidity_reference, limitToLast(1));

// onValue(recentHumidityRef, (snapshot) => {

//     let humidity = '';

//     snapshot.forEach((childSnapshot) => {

//         // const childKey = childSnapshot.key;
//         const childData = childSnapshot.val();

//         // console.log('childKey');
//         // console.log(childKey);
//         // console.log('childData');
//         // console.log(childData);

//         humidity = childData.percent + '%';
//     });

//     humidity_text.innerHTML = humidity;
// });
// , {
//     onlyOnce: true
// });

//////////////////////////////////GET CO2 PPM/////////////////////////////////////////

// const co2_text = document.getElementById('co2_text');

// const co2_reference = ref(db, 'co2/');

// const recentCO2Ref = query(co2_reference, limitToLast(1));

// onValue(recentCO2Ref, (snapshot) => {

//     let co2 = '';

//     snapshot.forEach((childSnapshot) => {

//         // const childKey = childSnapshot.key;
//         const childData = childSnapshot.val();

//         // console.log('childKey');
//         // console.log(childKey);
//         // console.log('childData');
//         // console.log(childData);

//         co2 = childData.ppm;
//     });

//     co2_text.innerHTML = co2;
// });
// , {
//     onlyOnce: true
// });

//////////////////////////////////GET LIGHT LUX/////////////////////////////////////////

// const light_text = document.getElementById('light_text');

// const light_reference = ref(db, 'light/');

// const recentLightRef = query(light_reference, limitToLast(1));

// onValue(recentLightRef, (snapshot) => {

//     let light = '';

//     snapshot.forEach((childSnapshot) => {

//         // const childKey = childSnapshot.key;
//         const childData = childSnapshot.val();

//         // console.log('childKey');
//         // console.log(childKey);
//         // console.log('childData');
//         // console.log(childData);

//         light = childData.lux;
//     });

//     light_text.innerHTML = light;
// });
// , {
//     onlyOnce: true
// });