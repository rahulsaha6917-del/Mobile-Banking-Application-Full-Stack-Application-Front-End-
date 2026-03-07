let currentBalance = 0;
let loggedUser = null;

const API = "http://localhost:9093/api/bank";

/* LOGIN */
function login(){

let username=document.getElementById("username").value.trim();
let password=document.getElementById("password").value.trim();

if(!username || !password){
alert("Enter username and password");
return;
}

fetch(API+"/login",{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
username:username,
password:password
})

})
.then(res=>{

if(!res.ok){
throw new Error();
}

return res.json();

})
.then(data=>{

loggedUser=data;

document.getElementById("loginCard").classList.add("hidden");
document.getElementById("dashboard").classList.remove("hidden");

document.getElementById("userDisplay").innerText=data.username;

alert("Login Successful");

})
.catch(()=>{
alert("Invalid Username or Password");
});

}


/* REGISTER */
function register(){

let username=document.getElementById("regUser").value.trim();
let password=document.getElementById("regPass").value.trim();

if(!username || !password){
alert("Fill all fields");
return;
}

fetch(API+"/register",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
username:username,
password:password
})

})
.then(res=>res.text())
.then(msg=>{

alert(msg);

backToLogin();

})
.catch(()=>alert("Registration failed"));

}


/* DEPOSIT */
function deposit(){

if(!loggedUser){
alert("Login first");
return;
}

let amount=Number(document.getElementById("amount").value);

if(amount<=0){
alert("Enter valid amount");
return;
}

fetch(API+"/deposit",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
userId:loggedUser.id,
amount:amount
})

})
.then(res=>res.text())
.then(msg=>{

alert(msg);

currentBalance+=amount;

updateBalance();

addHistory("Deposit",amount);

document.getElementById("amount").value="";

})
.catch(()=>alert("Deposit failed"));

}


/* WITHDRAW */
function withdraw(){

if(!loggedUser){
alert("Login first");
return;
}

let amount=Number(document.getElementById("amount").value);

if(amount<=0){
alert("Enter valid amount");
return;
}

fetch(API+"/withdraw",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
userId:loggedUser.id,
amount:amount
})

})
.then(res=>res.text())
.then(msg=>{

alert(msg);

currentBalance-=amount;

updateBalance();

addHistory("Withdraw",amount);

document.getElementById("amount").value="";

})
.catch(()=>alert("Withdraw failed"));

}


/* UPDATE BALANCE */
function updateBalance(){
document.getElementById("balance").innerText=currentBalance;
}


/* ADD HISTORY */
function addHistory(type,amount){

let history=document.getElementById("history");

let date=new Date().toLocaleString();

let row=`
<tr>
<td>${type}</td>
<td>₹${amount}</td>
<td>${date}</td>
</tr>
`;

history.innerHTML+=row;

}


/* CLEAR HISTORY */
function clearHistory(){
document.getElementById("history").innerHTML="";
}


/* RESET PASSWORD */
function resetPassword(){

    let username = document.getElementById("forgotUser").value.trim();
    let newPassword = document.getElementById("newPass").value.trim();

    if(!username || !newPassword){
        alert("Fill all fields");
        return;
    }

    fetch("http://localhost:9093/api/bank/resetPassword",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            username:username,
            password:newPassword
        })

    })
    .then(res=>res.text())
    .then(msg=>{
        alert(msg);
        backToLogin();
    })
    .catch(()=>{
        alert("Password reset failed");
    });
}


/* UI CONTROLS */

function showRegister(){
hideAll();
document.getElementById("registerCard").classList.remove("hidden");
}

function showForgot(){
hideAll();
document.getElementById("forgotCard").classList.remove("hidden");
}

function backToLogin(){
hideAll();
document.getElementById("loginCard").classList.remove("hidden");
}

function hideAll(){

document.getElementById("loginCard").classList.add("hidden");
document.getElementById("registerCard").classList.add("hidden");
document.getElementById("forgotCard").classList.add("hidden");

}


/* LOGOUT */

function logout(){

if(confirm("Logout?")){

loggedUser=null;

currentBalance=0;

document.getElementById("balance").innerText="0";

document.getElementById("history").innerHTML="";

document.getElementById("dashboard").classList.add("hidden");

document.getElementById("loginCard").classList.remove("hidden");

}

}