import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, set, push, query, limitToLast } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyC9CqjVBCcmjeYAZdX3grW213s2jyMHpAw",
    authDomain: "g40attendance.firebaseapp.com",
    databaseURL: "https://g40attendance-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "g40attendance",
    storageBucket: "g40attendance.firebasestorage.app",
    messagingSenderId: "487009872314",
    appId: "1:487009872314:web:9842ea3115be17e5505583"
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

//////////////////////////////////GET TEMPERATURE/////////////////////////////////////////

const temperature_text = document.getElementById('temperature_text');

const temperature_reference = ref(db, 'temperature/');

const recentTempRef = query(temperature_reference, limitToLast(1));

onValue(recentTempRef, (snapshot) => {

    let temperature = '';

    snapshot.forEach((childSnapshot) => {

        // const childKey = childSnapshot.key;
        const childData = childSnapshot.val();

        // console.log('childKey');
        // console.log(childKey);
        // console.log('childData');
        // console.log(childData);

        temperature = childData.celcius + '°C';
    });

    temperature_text.innerHTML = temperature;
});
// , {
//     onlyOnce: true
// });

//////////////////////////////////GET HUMIDITY/////////////////////////////////////////

const humidity_text = document.getElementById('humidity_text');

const humidity_reference = ref(db, 'humidity/');

const recentHumidityRef = query(humidity_reference, limitToLast(1));

onValue(recentHumidityRef, (snapshot) => {

    let humidity = '';

    snapshot.forEach((childSnapshot) => {

        // const childKey = childSnapshot.key;
        const childData = childSnapshot.val();

        // console.log('childKey');
        // console.log(childKey);
        // console.log('childData');
        // console.log(childData);

        humidity = childData.percent + '%';
    });

    humidity_text.innerHTML = humidity;
});
// , {
//     onlyOnce: true
// });

//////////////////////////////////GET CO2 PPM/////////////////////////////////////////

const co2_text = document.getElementById('co2_text');

const co2_reference = ref(db, 'co2/');

const recentCO2Ref = query(co2_reference, limitToLast(1));

onValue(recentCO2Ref, (snapshot) => {

    let co2 = '';

    snapshot.forEach((childSnapshot) => {

        // const childKey = childSnapshot.key;
        const childData = childSnapshot.val();

        // console.log('childKey');
        // console.log(childKey);
        // console.log('childData');
        // console.log(childData);

        co2 = childData.ppm;
    });

    co2_text.innerHTML = co2;
});
// , {
//     onlyOnce: true
// });

//////////////////////////////////GET LIGHT LUX/////////////////////////////////////////

const light_text = document.getElementById('light_text');

const light_reference = ref(db, 'light/');

const recentLightRef = query(light_reference, limitToLast(1));

onValue(recentLightRef, (snapshot) => {

    let light = '';

    snapshot.forEach((childSnapshot) => {

        // const childKey = childSnapshot.key;
        const childData = childSnapshot.val();

        // console.log('childKey');
        // console.log(childKey);
        // console.log('childData');
        // console.log(childData);

        light = childData.lux;
    });

    light_text.innerHTML = light;
});
// , {
//     onlyOnce: true
// });