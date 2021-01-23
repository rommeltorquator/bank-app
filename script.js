let Users=[];
let Users_json;

/* ******************************************************************

                    Dom handlers

****************************************************************** */
if( document.getElementById('createUser_form') != null ){
    document.getElementById('createUser_form').onsubmit=function(){
        let user=document.getElementById("fullName").value;
        let balance=document.getElementById("balance").value;
        let email=document.getElementById("email").value;
        createUser(user,balance,email);
        document.getElementById("fullName").value="";
        document.getElementById("balance").value="";
        return false; //important to prevent default behaviour at the end of your submit handler
    };
}

if( document.getElementById('getBalance_form') != null ){
    document.getElementById('getBalance_form').onsubmit=function(){
        let user=document.getElementById("fullName").value;
        let trans_checkbox=document.getElementById("trans_hist");
        let trans_hist_table=document.getElementById("trans_hist_table");
        let trans_hist_body=document.getElementById("trans_hist_body");
        getBalance(user);
        if(trans_checkbox.checked===true){
            trans_hist_table.style.display="table";
            listTransHistory(user);
        }
        document.getElementById("fullName").value="";
        document.getElementById("trans_hist").checked=false;
        return false; //important to prevent default behaviour at the end of your submit handler
    };

    document.getElementById('trans_hist_clear').onclick=function(){
        document.getElementById("trans_hist_table").style.display="none";
        document.getElementById("balance").innerHTML="";
    }

}

if( document.getElementById('deposit_form') != null ){
    document.getElementById('deposit_form').onsubmit=function(){
        let user=document.getElementById("deposit_name").value;
        let amount=parseInt(document.getElementById("deposit").value);
        deposit(user,amount);
        document.getElementById("deposit_name").value="";
        document.getElementById("deposit").value="";
        return false; //important to prevent default behaviour at the end of your submit handler
    };
}

if( document.getElementById('withdraw_form') != null ){
    document.getElementById('withdraw_form').onsubmit=function(){
        let user=document.getElementById("withdraw_name").value;
        let amount=parseInt(document.getElementById("withdraw").value);
        withdraw(user,amount);
        document.getElementById("withdraw_name").value="";
        document.getElementById("withdraw").value="";
        return false; //important to prevent default behaviour at the end of your submit handler
    };
}

if( document.getElementById('transfer_form') != null ){
    document.getElementById('transfer_form').onsubmit=function(){
        let sender=document.getElementById("transfer_sender").value;
        let receiver=document.getElementById("transfer_receiver").value;
        let amount=parseInt(document.getElementById("transfer").value);
        send(sender,receiver,amount);
        document.getElementById("transfer_sender").value="";
        document.getElementById("transfer_receiver").value="";
        document.getElementById("transfer").value="";
        return false; //important to prevent default behaviour at the end of your submit handler
    };
}

/* ******************************************************************

                    Bank App main methods

****************************************************************** */

function User(name,balance,email=""){
    this.name=name;
    this.balance=parseInt(balance);
    this.email=email;
    this.transaction_history=[];
}

function Transaction(operation,amount,balance,datetime){
    this.operation=operation;
    this.amount=amount;
    this.balance=balance;
    this.datetime=datetime;
}

function createUser(user,balance=0,email=""){
    fetchData();
    if( validNameFormat(user) && validAmtFormat(balance) ){
        Users.push(new User(user,balance,email));
    }
    updateData();

    document.getElementById("createUser_status").innerHTML="User has been created!";
    setTimeout(function(){
        document.getElementById("createUser_status").innerHTML="";
    },2000);
}

function deposit(user,amount){
    fetchData();
    let index=userExists(user);

    if( index>=0 && validAmtFormat(amount) ){
        let amount_parsed=parseInt(amount);
        currentDatetime = getDatetime();
        Users[index].balance+=amount_parsed;
        Users[index].transaction_history.push( new Transaction("+",amount_parsed,Users[index].balance,currentDatetime));
        updateData();

        let addedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(amount);
        document.getElementById("transaction_status").innerHTML="Transaction complete! "+addedAmount+" added to "+user+"'s account";
        // document.getElementById("transaction_status").innerHTML="Transaction complete!";
        
        sendNotif(index,"deposit",addedAmount,currentDatetime);

        setTimeout(function(){
            document.getElementById("transaction_status").innerHTML="";
        },5000);    
    }else{
        alert("Deposit action invalid!");
    }
    
}

function withdraw(user,amount){
    fetchData();
    let index=userExists(user);

    //check if balance is sufficient for withdrawal
    if( index>=0 && validAmtFormat(amount) && Users[index].balance>=amount){
        let amount_parsed=parseInt(amount);
        currentDatetime = getDatetime();
        Users[index].balance-=amount_parsed;
        Users[index].transaction_history.push( new Transaction("-",amount_parsed,Users[index].balance,currentDatetime));

        updateData();

        let deductedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(amount);
        document.getElementById("transaction_status").innerHTML="Transaction complete! "+deductedAmount+" deducted from "+user+"'s account";
        // document.getElementById("transaction_status").innerHTML="Transaction complete!";
        
        sendNotif(index,"withdrawal",deductedAmount,currentDatetime);

        setTimeout(function(){
            document.getElementById("transaction_status").innerHTML="";
        },5000);  
    }else{
        alert("Withdrawal action invalid! Withdrawal amount is greater than existing balance.");
    }

}

function send(from_user,to_user,amount){
    fetchData();
    let sender_index=userExists(from_user);
    let receiver_index=userExists(to_user);

    if( sender_index>=0 && receiver_index>=0 && validAmtFormat(amount) && Users[sender_index].balance>=amount ){
        let amount_parsed=parseInt(amount);
        currentDatetime = getDatetime();

        Users[sender_index].balance-=amount_parsed;
        Users[sender_index].transaction_history.push( new Transaction("-",amount_parsed,Users[sender_index].balance,currentDatetime));

        Users[receiver_index].balance+=amount_parsed;
        Users[receiver_index].transaction_history.push( new Transaction("+",amount_parsed,Users[receiver_index].balance,currentDatetime));

        updateData();
        
        let transAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(amount);
        document.getElementById("transaction_status").innerHTML="Transaction complete! "+transAmount+" transferred from "+from_user+" to "+to_user+"'s account";
        // document.getElementById("transaction_status").innerHTML="Transaction complete!";

        //send email notif to sender
        sendNotif(sender_index,"send",transAmount,currentDatetime,receiver_index);
        //send email notif to receiver
        sendNotif(receiver_index,"deposit",transAmount,currentDatetime);

        setTimeout(function(){
            document.getElementById("transaction_status").innerHTML="";
        },5000);  

    }else{
        alert("Send money action invalid! Check if users are valid and amount doesn't exceed sender's balance");
    }

}

function getBalance(user){
    fetchData();
    let balance=document.getElementById("balance");
    let index=userExists(user);
    if( index>=0 ){
        balance.innerHTML = user+ " current balance: "+ new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(Users[index].balance);
        
    }else{
        alert("Get balance action invalid as user can't be found on the system");
    }
    
}

function listTransHistory(user){
    fetchData();
    let index=userExists(user);
    document.getElementById("trans_hist_body").innerHTML="";
    if( index>=0 ){
        Users[index].transaction_history.forEach(function(item,index){
            let tr=document.createElement("TR");
            let amt_td=document.createElement("TD");
            let bal_td=document.createElement("TD");
            let dt_td=document.createElement("TD");

            amt_td.innerHTML=item.operation+item.amount;
            bal_td.innerHTML=new Intl.NumberFormat('en-US', { style: 'currency', currency: 'PHP' }).format(item.balance);
            dt_td.innerHTML=item.datetime;

            tr.appendChild(amt_td);
            tr.appendChild(bal_td);
            tr.appendChild(dt_td);

            document.getElementById("trans_hist_body").appendChild(tr);
        });
        updateData();
    }
}

function listUsers(){
    fetchData();

    document.getElementById("users_list_body").innerHTML="";

    Users.forEach(function(item,index){
        let tr=document.createElement("TR");
        let name_td=document.createElement("TD");
        let bal_td=document.createElement("TD");

        name_td.innerHTML=item.name;
        bal_td.innerHTML="Php "+item.balance;

        tr.appendChild(name_td);
        tr.appendChild(bal_td);

        document.getElementById("users_list_body").appendChild(tr);
    });

    updateData();
}

//return true if users's name does not start with a number/s
function validNameFormat(name){
    if(name.match(/^\d/)){
        alert("Action invalid! Name cannot start with a number");
        return false;
    }else{
        return true;
    }
}

//return true if the amount is positive or 0
function validAmtFormat(amount){
    if(amount<0 && typeof(amount)!=="number" ){
        alert("Value invalid! Amount cannot be negative and should be a number");
        return false;
    }else{
        return true;
    }
}

//return array index if user exists in Users Array else return -1
function userExists(name){
    for(i=0;i<Users.length;i++){
        if(Users[i].name===name){
            return i;
        }
    }
    console.log("User "+name+" doesn't exist in Bank database");
    return -1; //No match on Users List
}

//stringify Users list to Users_json and adds it to localStorage
function updateData(){
    Users_json = JSON.stringify(Users);
    localStorage.setItem("Users",Users_json);
}

//Gets localStorage item and updates Users array
function fetchData(){
    if( localStorage.getItem("Users") !== null ){
        Users=JSON.parse(localStorage.getItem("Users"));
    }
}

//return current local date time as a string
function getDatetime(){
    return new Date().toLocaleString().replace(",","").replace(/:.. /," ");
}

function loadUserData(){
    fetchData();
    Users=[];
    Users.push(new User("John Cena",17000000,"john_cena@defaultmail.com"));
    Users.push(new User("Mary Anderson",250000,"mary_anderson@defaultmail.com"));
    Users.push(new User("July Valentine",35000,"july_valentine@defaultmail.com"));
    Users.push(new User("Rommel Torquator",1000,"rommel_torquator@defaultmail.com"));
    Users.push(new User("jc",1000,"ninjakilledmessage@gmail.com"));
    Users.push(new User("jc2",1000,"proxybetazero@gmail.com"));
    
    updateData();
    alert("Old user data removed and replaced by default Users");

    
}

function toggleTransferOptions(transaction){
    let deposit_container = document.getElementById("deposit_container");
    // deposit_container.style.display="none";
    let withdraw_container=document.getElementById("withdraw_container");
    // withdraw_container.style.display="none";
    let transfer_container=document.getElementById("transfer_container");
    // transfer_container.style.display="none";
    if(transaction==="deposit"){
        if(deposit_container.style.display==="flex"){
            deposit_container.style.display="none";
        }else{
            deposit_container.style.display="flex";
            withdraw_container.style.display="none";
            transfer_container.style.display="none";
        }
    }else if(transaction==="withdraw"){
        if(withdraw_container.style.display==="flex"){
            withdraw_container.style.display="none";
        }else{
            deposit_container.style.display="none";
            withdraw_container.style.display="flex";
            transfer_container.style.display="none";
        }
    }else{
        if(transfer_container.style.display==="flex"){
            transfer_container.style.display="none";
        }else{
            deposit_container.style.display="none";
            withdraw_container.style.display="none";
            transfer_container.style.display="flex";
        }
    }
}

function sendNotif(user_index,action,amount,datetime,receiver_index=-1){

    //sample not valid email
    // let email_to="jackburner233@gmail.com";
    let email_from="donotreplybankapp@gmail.com";
    let email_to;
    let email_subj;
    let email_body;
    let email_body_name;

    if(Users[user_index].email===""){
        console.log("No email address linked to user "+Users[user_index].name);
        return;
    }

    if(action==="deposit"){ //action is deposit
        email_to=Users[user_index].email;
        email_subj="Bank App: A deposit trasaction made to your account";
        email_body_name=Users[user_index].name;
        email_body="Hi "+email_body_name+",\n"+"Your account received "+amount+" on "+datetime;
        email_body="<html>"+"<h3>Hi "+email_body_name+",</h3>"+"<p>Your account received "+amount+" on "+datetime+"</p></html>";
    }else if(action==="withdrawal"){ //action is withdrawal
        email_to=Users[user_index].email;
        email_subj="Bank App: A withdrawal trasaction made by your account";
        email_body_name=Users[user_index].name;
        email_body="<html>"+"<h3>Hi "+email_body_name+",</h3>"+"<p>Your account was deducted "+amount+" on "+datetime+"</p></html>";
    }else{ //action is send
        email_to=Users[user_index].email;
        email_subj="Bank App: A transfer trasaction made by your account";
        email_body_name=Users[user_index].name;
        email_body="<html>"+"<h3>Hi "+email_body_name+",</h3>"+"Your account has sent "+amount+" to "+Users[receiver_index].name+" on "+datetime+"</p></html>";
    }

    Email.send({
        Host : "smtp.gmail.com",
        Username : "randomsender18@gmail.com",
        Password : "TCVMiiRio1nQj",
        To : email_to,
        From : email_from,
        Subject : email_subj,
        Body : email_body
    }).then(
    //   message => alert(message)
        console.log("email notif sent")
    );
}