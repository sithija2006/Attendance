


// Store employee data in localStorage
const employees = JSON.parse(localStorage.getItem("employees")) || [];
const attendanceLog = JSON.parse(localStorage.getItem("attendanceLog")) || [];

// Add employee functionality
document.getElementById("add-employee")?.addEventListener("click", () => {
  const name = document.getElementById("employee-name").value;
  const photoInput = document.getElementById("employee-photo");
  if (!name || !photoInput.files[0]) {
    alert("Please provide both name and photo!");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    employees.push({ name, photo: reader.result });
    localStorage.setItem("employees", JSON.stringify(employees));
    alert("Employee added successfully!");
    document.getElementById("add-employee-form").reset();
  };
  reader.readAsDataURL(photoInput.files[0]);
});

// Display attendance log for Admin
function renderLog() {
  const logContainer = document.getElementById("log-container");
  if (!logContainer) return;

  logContainer.innerHTML = attendanceLog
    .map((log) => `<p>${log.name} - ${log.time}</p>`)
    .join("");
}
renderLog();

// Display employee list for marking attendance
function renderEmployeeList() {
  const listContainer = document.getElementById("employee-list");
  if (!listContainer) return;

  listContainer.innerHTML = employees
    .map(
      (employee, index) =>
        `<div class="p-4 border rounded mb-4">
          <img src="${employee.photo}" class="w-16 h-16 rounded-full mb-2" />
          <p>${employee.name}</p>
          <button class="bg-blue-500 text-white px-4 py-2 rounded" onclick="markAttendance(${index})">Mark Attendance</button>
        </div>`
    )
    .join("");
}
renderEmployeeList();

// Mark attendance
function markAttendance(index) {
  const employee = employees[index];
  const time = new Date().toLocaleString();

  attendanceLog.push({ name: employee.name, time });
  localStorage.setItem("attendanceLog", JSON.stringify(attendanceLog));
  alert(`Attendance marked for ${employee.name}`);
  renderLog();
}
