import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref, set, push, query, limitToLast } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBjbzbTm00LCU_c03O-ijwn-SH_I1NLoWI",
  authDomain: "amir-dua.firebaseapp.com",
  projectId: "amir-dua",
  storageBucket: "amir-dua.firebasestorage.app",
  messagingSenderId: "226472608402",
  appId: "1:226472608402:web:315ce5eca8a1305ea81c4b",
  databaseURL: "https://amir-dua-default-rtdb.asia-southeast1.firebasedatabase.app"
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

//////////////////////////////////GET STUDENTS/////////////////////////////////////////

// const light_text = document.getElementById('light_text');

const students_reference = ref(db, 'students/');

// const recentStudentsRef = query(students_reference, limitToLast(1));

onValue(students_reference, (snapshot) => {

    let students = [];

    snapshot.forEach((childSnapshot) => {

        // const childKey = childSnapshot.key;
        const childData = childSnapshot.val();

        // console.log('childKey');
        // console.log(childKey);
        // console.log('childData');
        // console.log(childData);

        students.push(
            {
                name: childData.name,
                attendance: childData.attendance
            }
        )
    });

    let list_students = '';
    let total_present = 0;
    let total_absent = 0;
    for (let i = 0; i < students.length; i++) {

        if(students[i].attendance == 'present') {
            total_present++;
        } else if(students[i].attendance == 'absent') {
            total_absent++;
        }

        list_students = list_students + '<li class="list-group-item">' + students[i].name + '\t===> is ' + students[i].attendance + '</li>';
        // console.log(list_students);

    }

    const text_list_student = document.getElementById('text_student_list');

    text_list_student.innerHTML = list_students;

    const total_student_text = document.getElementById('total_student_text');
    total_student_text.innerHTML = students.length

    const present_text = document.getElementById('present_text');
    present_text.innerHTML = total_present

    const absent_text = document.getElementById('absent_text');
    absent_text.innerHTML = total_absent

    // light_text.innerHTML = light;
});
// , {
//     onlyOnce: true
// });
