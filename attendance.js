const video = document.getElementById("camera");
const resultDiv = document.getElementById("result");

// Start camera feed
navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    console.error("Camera access denied:", err);
  });

// Function to capture the current frame from the video
const captureAndVerify = () => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageData = canvas.toDataURL("image/jpeg");

  fetch("http://127.0.0.1:5000/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image: imageData }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        resultDiv.innerHTML = `<p class="text-green-500 font-bold">Attendance marked for ${data.name}</p>`;
      } else {
        resultDiv.innerHTML = `<p class="text-red-500 font-bold">${data.message}</p>`;
      }
    })
    .catch((err) => {
      console.error("Error:", err);
      resultDiv.innerHTML = `<p class="text-red-500 font-bold">Error processing attendance.</p>`;
    });
};

// Continuously check for faces every 3 seconds
setInterval(captureAndVerify, 3000);
