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
    document.getElementById("loginCard").classList.remove("hidden");
}

// ================= SEND EMAIL =================
function sendMail(message) {
    fetch(API + "/sendMail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: currentUser.email,
            message: message
        })
    })
    .then(res => res.text())
    .then(() => console.log("Mail Sent"));
}

// ================= REGISTER WITH OTP =================
function register() {
    let username = document.getElementById("regUser").value;
    let password = document.getElementById("regPass").value;
    let email = document.getElementById("regEmail").value;
    let phone = document.getElementById("regPhone").value;

    fetch(API + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email, phone })
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        currentUser = { username, phone, email };
        sendOtp(phone);

        document.getElementById("registerCard").classList.add("hidden");
        document.getElementById("otpCard").classList.remove("hidden");
    });
}

// ================= LOGIN WITH OTP =================
function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let phone = document.getElementById("loginPhone").value;

    fetch(API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(user => {
        if (user && user.id) {
            currentUser = { ...user, phone }; // save phone for OTP
            sendOtp(phone);

            document.getElementById("loginCard").classList.add("hidden");
            document.getElementById("otpCard").classList.remove("hidden");
        } else {
            alert("Invalid Login");
        }
    });
}

// ================= SEND OTP =================
function sendOtp(phone) {
    fetch(`${API}/sendOtp?phone=${phone}`, { method: "POST" })
        .then(res => res.text())
        .then(msg => alert(msg));
}

// ================= VERIFY OTP =================
function verifyOtp() {
    let otp = document.getElementById("otpInput").value;

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
        });
}

// ================= LOAD BALANCE =================
function loadBalance() {
    fetch(API + "/balance/" + currentUser.id)
        .then(res => res.text())
        .then(balance => {
            document.getElementById("balance").innerText = balance;
        });
}

// ================= DEPOSIT =================
function deposit() {
    let amount = document.getElementById("amount").value;

    fetch(API + "/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, amount: amount })
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        sendMail("₹" + amount + " deposited successfully into your account.");
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
        body: JSON.stringify({ userId: currentUser.id, amount: amount })
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        sendMail("₹" + amount + " withdrawn from your account.");
        loadBalance();
        loadHistory();
    });
}

// ================= TRANSFER MONEY =================
function transferMoney() {
    let receiver = document.getElementById("receiver").value;
    let amount = document.getElementById("transferAmount").value;

    fetch(API + "/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            senderId: currentUser.id,
            receiverUsername: receiver,
            amount: amount
        })
    })
    .then(res => res.text())
    .then(msg => {
        alert(msg);
        sendMail("₹" + amount + " transferred to " + receiver + " successfully.");
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
                let dateTime = tx.dateTime ? new Date(tx.dateTime).toLocaleString() : "N/A";
                let row = `<tr>
                    <td>${tx.type}</td>
                    <td>₹${tx.amount}</td>
                    <td>${dateTime}</td>
                </tr>`;
                historyTable.innerHTML += row;
            });
        });
}

// ================= CLEAR HISTORY =================
function clearHistory() {
    document.getElementById("history").innerHTML = "";
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
    currentUser = null;
    document.getElementById("dashboard").classList.add("hidden");
    document.getElementById("loginCard").classList.remove("hidden");
}