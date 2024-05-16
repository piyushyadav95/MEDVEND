// Initialize Firebase Admin SDK
var admin = require("firebase-admin");
var serviceAccount = require("path/to/serviceAccountKey.json");

var serviceAccount = {
  "type": "service_account",
  "project_id": "medvend-7c6e8",
  "private_key_id": "AIzaSyA5yWQR0X1y0_cW5Z8_K4ZqfzzBi7FT6dA",
  // ... other fields ...
};


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://medvend-7c6e8-default-rtdb.asia-southeast1.firebasedatabase.app"
});

// Continue with the rest of your code using `admin.database()`

// Function to open QR code scanner, collect QR data, and send it to Firebase Realtime Database
function scanQRCodeAndSendToFirebase() {
  // Open the webcam
  const video = document.getElementById('video');

  // Flag to track whether a QR code has been scanned
  let qrCodeScanned = false;

  // Initialize the Firebase Realtime Database reference
  const database = firebase.database(); // Use `database` from the global scope
  const qrCodesRef = database.ref('qr_codes');

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
      video.srcObject = stream;

      // OpenCV Initialization callback
      window.onOpenCvReady = function () {
        const cap = new cv.VideoCapture(video);

        const processFrame = () => {
          const frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
          cap.read(frame);

          // Decode QR codes
          const decodedObjects = decode(frame);

          // Check for QR codes
          decodedObjects.forEach(obj => {
            const qrData = obj.data;
            console.log(`QR Code Data: ${qrData}`);

            // Send data to Firebase Realtime Database
            qrCodesRef.push({ data: qrData });

            console.log(`Data sent to Firebase Realtime Database`);

            // Set the flag to true, indicating that a QR code has been scanned
            qrCodeScanned = true;
          });

          // Display the frame
          cv.imshow("QR Code Scanner", frame);

          // Release the frame
          frame.delete();

          // Continue processing frames if a QR code has not been scanned
          if (!qrCodeScanned) {
            requestAnimationFrame(processFrame);
          }
        };

        // Start processing frames
        processFrame();
      };
    })
    .catch(function (err) {
      console.error('Error accessing camera:', err);
    });

  // Break the loop when 'q' key is pressed
  document.addEventListener('keydown', function (event) {
    if (event.key === 'q') {
      video.srcObject.getTracks().forEach(track => track.stop());
      qrCodeScanned = true; // to break the loop
    }
  });
}
