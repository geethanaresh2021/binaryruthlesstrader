importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyA2ILDlxtYs2CT-2mJItRV1NApSIaH4t3g",
    authDomain: "binary-ruthless-trader-26654.firebaseapp.com",
    databaseURL: "https://binary-ruthless-trader-26654-default-rtdb.firebaseio.com",
    projectId: "binary-ruthless-trader-26654",
    storageBucket: "binary-ruthless-trader-26654.firebasestorage.app",
    messagingSenderId: "533209261799",
    appId: "1:533209261799:web:a398ab21b0f913683ea442",
    measurementId: "G-WQCXCMV5PR"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('📩 Background Notification:', payload);
    const notificationTitle = payload.notification?.title || 'BRT Admin Alert';
    const notificationOptions = {
        body: payload.notification?.body || 'Check admin panel for details',
        icon: '/favicon.ico',
        vibrate: [200, 100, 200],
        sound: 'default'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
