let Users=[];

function User(name,balance){
    this.name=name;
    this.balance=balance;
}

function createUser(user,balance=0){
    if( validNameFormat(user) && validAmtFormat(balance) ){
        Users.push(new User(user,balance));
    }
}

function deposit(user,amount){
    let new_balance;
    let index=userExists(user);
    if( index>=0 && validAmtFormat(amount) ){
        new_balance=Users[index].balance+amount;
        Users[index].balance=new_balance;
        return new_balance;
    }else{
        alert("Deposit action invalid!");
    }

    
}

function withdraw(user,amount){
    let new_balance;
    let index=userExists(user);

    //check if balance is sufficient for withdrawal
    if( index>=0 && validAmtFormat(amount) && Users[index].balance>=amount){
        new_balance=Users[index].balance-amount;
        Users[index].balance=new_balance;
        return new_balance;
    }else{
        alert("Withdrawal action invalid! Withdrawal amount is greater than existing balance.");
    }

}

function send(from_user,to_user,amount){
    let sender_balance;
    let receiver_balance
    let sender_index=userExists(from_user);
    let receiver_index=userExists(to_user);

    if( sender_index>=0 && receiver_index>=0 && validAmtFormat(amount) && Users[sender_index].balance>=amount ){
        
        Users[sender_index].balance-=amount;
        sender_balance=Users[sender_index].balance;

        Users[receiver_index].balance+=amount;
        receiver_balance=Users[receiver_index].balance;

        return "sender bal: " + sender_balance+" receiver bal: "+receiver_balance; 
    }else{
        alert("Send money action invalid! Check if users are valid and amount doesn't exceed sender's balance");
    }

}

function getBalance(user){
    let balance;
    let index=userExists(user);
    if( index>=0 ){
        balance=Users[index].balance;
        return "Php "+balance;
    }else{
        return "Get balance action invalid as user can't be found on the system";
    }
    
}

function listUsers(){
    let all_users='';
    Users.forEach(function(item,index){
        all_users=all_users+item.name+' ';
    });
    return "Current registered users: "+all_users;
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
    alert("User "+name+" doesn't exist in Bank database");
    return -1; //No match on Users List
}