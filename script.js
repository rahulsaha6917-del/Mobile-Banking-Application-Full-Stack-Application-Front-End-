let currentUser = null;
const API = "http://localhost:9093/api/bank";


// ================= SHOW REGISTER =================
function showRegister() {
    document.getElementById("loginCard").classList.add("hidden");
    document.getElementById("registerCard").classList.remove("hidden");
}


// ================= SHOW FORGOT =================
function showForgot() {
    document.getElementById("loginCard").classList.add("hidden");
    document.getElementById("forgotCard").classList.remove("hidden");
}


// ================= BACK TO LOGIN =================
function backToLogin() {
    document.getElementById("registerCard").classList.add("hidden");
    document.getElementById("forgotCard").classList.add("hidden");
    document.getElementById("otpCard").classList.add("hidden");
    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("loginCard").classList.remove("hidden");
}


// ================= SEND EMAIL =================
function sendMail(message) {

    if (!currentUser || !currentUser.email) return;

    fetch(API + "/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: currentUser.email,
            message: message
        })
    })
    .then(res => res.text())
    .then(() => console.log("Mail Sent"))
    .catch(err => console.error("Mail Error:", err));
}


// ================= REGISTER =================
function register() {

    let username = document.getElementById("regUser").value.trim();
    let password = document.getElementById("regPass").value.trim();
    let email = document.getElementById("regEmail").value.trim();
    let phone = document.getElementById("regPhone").value.trim();

    if (!username || !password || !email || !phone) {
        alert("Please fill all fields");
        return;
    }

    fetch(API + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, phone })
    })
    .then(res => res.text())
    .then(msg => {

        alert(msg);

        currentUser = { username, email, phone };

        sendOtp(phone);

        document.getElementById("registerCard").classList.add("hidden");
        document.getElementById("otpCard").classList.remove("hidden");

    })
    .catch(err => {
        console.error(err);
        alert("Registration failed");
    });
}


// ================= LOGIN =================
function login() {

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();
    let phone = document.getElementById("loginPhone").value.trim();

    if (!username || !password) {
        alert("Enter username and password");
        return;
    }

    fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => {

        if (!res.ok) {
            throw new Error("Invalid Credentials");
        }

        return res.json();
    })
    .then(user => {

        if (!user || !user.id) {
            alert("Invalid Username or Password");
            return;
        }

        alert("Login Successful");

        currentUser = {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: phone
        };

        sendOtp(phone);

        document.getElementById("loginCard").classList.add("hidden");
        document.getElementById("otpCard").classList.remove("hidden");

    })
    .catch(err => {
        console.error(err);
        alert("Invalid Username or Password");
    });
}


// ================= SEND OTP =================
function sendOtp(phone) {

    fetch(`${API}/sendOtp?phone=${phone}`, { method: "POST" })
    .then(res => res.text())
    .then(msg => alert(msg))
    .catch(err => console.error("OTP Error:", err));
}


// ================= VERIFY OTP =================
function verifyOtp() {

    let otp = document.getElementById("otpInput").value.trim();

    if (!otp) {
        alert("Enter OTP");
        return;
    }

    fetch(`${API}/verifyOtp?phone=${currentUser.phone}&otp=${otp}`, { method: "POST" })
    .then(res => res.text())
    .then(msg => {

        if (msg === "OTP Verified Successfully") {

            document.getElementById("otpCard").classList.add("hidden");
            document.getElementById("dashboard").classList.remove("hidden");

            document.getElementById("userDisplay").innerText = currentUser.username;

            loadBalance();
            loadHistory();

        } else {
            alert(msg);
        }

    })
    .catch(err => console.error("OTP Verify Error:", err));
}


// ================= LOAD BALANCE =================
function loadBalance() {

    fetch(API + "/balance/" + currentUser.id)
    .then(res => res.text())
    .then(balance => {
        document.getElementById("balance").innerText = balance;
    })
    .catch(err => console.error(err));
}


// ================= DEPOSIT =================
function deposit() {

    let amount = document.getElementById("amount").value;

    fetch(API + "/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, amount })
    })
    .then(res => res.text())
    .then(msg => {

        alert(msg);

        sendMail("₹" + amount + " deposited successfully.");

        loadBalance();
        loadHistory();

    });
}


// ================= WITHDRAW =================
function withdraw() {

    let amount = document.getElementById("amount").value;

    fetch(API + "/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, amount })
    })
    .then(res => res.text())
    .then(msg => {

        alert(msg);

        sendMail("₹" + amount + " withdrawn from account.");

        loadBalance();
        loadHistory();

    });
}


// ================= TRANSFER =================
function transferMoney() {

    let receiver = document.getElementById("receiver").value;
    let amount = document.getElementById("transferAmount").value;

    fetch(API + "/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            senderId: currentUser.id,
            receiverUsername: receiver,
            amount
        })
    })
    .then(res => res.text())
    .then(msg => {

        alert(msg);

        sendMail("₹" + amount + " transferred to " + receiver);

        loadBalance();
        loadHistory();

    });
}


// ================= LOAD TRANSACTION HISTORY =================
function loadHistory() {

    fetch(API + "/transactions/" + currentUser.id)
    .then(res => res.json())
    .then(data => {

        let historyTable = document.getElementById("history");
        historyTable.innerHTML = "";

        data.forEach(tx => {

            let dateTime = tx.dateTime ?
                new Date(tx.dateTime).toLocaleString() : "N/A";

            historyTable.innerHTML += `
            <tr>
                <td>${tx.type}</td>
                <td>₹${tx.amount}</td>
                <td>${dateTime}</td>
            </tr>`;
        });

    });
}


// ================= CLEAR HISTORY =================
function clearHistory() {

    if (!currentUser) return;

    fetch(`${API}/transactions/${currentUser.id}/clear`, {
        method: "DELETE"
    })
    .then(res => res.text())
    .then(msg => {

        alert(msg);

        loadHistory();

    })
    .catch(err => console.error(err));
}


// ================= RESET PASSWORD =================
function resetPassword() {

    let username = document.getElementById("forgotUser").value;
    let password = document.getElementById("newPass").value;

    fetch(API + "/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.text())
    .then(msg => {

        alert(msg);

        backToLogin();

    });
}


// ================= LOGOUT =================
function logout() {

    if (!currentUser) return;

    fetch(`${API}/logout?userId=${currentUser.id}`, {
        method: "POST"
    })
    .then(res => res.text())
    .then(msg => {

        alert(msg);

        currentUser = null;

        document.getElementById("dashboard").classList.add("hidden");
        document.getElementById("loginCard").classList.remove("hidden");

    })
    .catch(err => console.error(err));
}