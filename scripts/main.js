//define task class

class Task {
    constructor(taskname){
        this.name = taskname;
        this.status = 0;
        this.id = new Date().getTime();
        return this;
    }
}
//array to store tasks
var TaskArray = [];

//application object
var app ={userid:0,username:""};

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    app.userid = user.uid;
    // User is signed in.
    //hide all the forms
    let authforms = document.querySelectorAll('.overlay');
    for(let i=0;i < authforms.length; i++){
        authforms[i].style.display = 'none';
    }
    //get username from database
    let path = 'users/'+app.userid;
    firebase.database().ref(path)
        .once('value')
        .then(function(snapshot){
            let username = snapshot.val().name;
            app.username = username;
            displayUserName(username);
        }
    );
    readTask(app.userid);
  } 
  else{
    // No user is signed in.
    showForm('signin-box');
    clearTaskList();
  }
});

function displayUserName(username){
    if(username){
        document.getElementById('username').innerText = username;
    }
    else{
        document.getElementById('username').innerText = '';
    }
}

window.addEventListener('load',function(){
    const SignUpTemplate = document.getElementById('signup-template');
    const SignInTemplate = document.getElementById('signin-template');
    
    //activate signup template
    var su_form = document.importNode(SignUpTemplate.content,true);
    //add form to document
    document.querySelector('.appview').appendChild(su_form);
    //activate signin template
    var si_form = document.importNode(SignInTemplate.content,true);
    //add form to document
    document.querySelector('.appview').appendChild(si_form);
    
    
    const signinlink = document.getElementById('signin-link');
    const signuplink = document.getElementById('signup-link');
    showForm('signin-box');
    signinlink.addEventListener('click',function(){
       showForm('signin-box'); 
    });
    signuplink.addEventListener('click',function(){
        showForm('signup-box'); 
    });
    
    //get a reference to the sign up form
    const signupform = document.getElementById('signup-form');
    signupform.addEventListener('submit',signUserUp);
    
    //get a reference to the sign in form
    const signinform = document.getElementById('signin-form');
    signinform.addEventListener('submit',signUserIn);
    
    //get a reference to logout button
    const logout = document.getElementById('logout');
    logout.addEventListener('click',logUserOut);
    
    //loadTasks();
    const TaskForm = document.getElementById('task-form');
    //add a listener for when form is submitted
    TaskForm.addEventListener('submit',onSubmit);
    //get a reference to task-list element
    const TaskList = document.getElementById('task-list');
    TaskList.addEventListener('click',changeTaskStatus);
    const Button = document.getElementById('remove');
    Button.addEventListener('click',removeDone);
    
    displayUserName(app.username);
});

function logUserOut(){
    firebase.auth().signOut().then(function() {
      // Sign-out successful.
      displayUserName(false);
      
      TaskArray = [];
    }).catch(function(error) {
      // An error happened.
    });
}
function signUserIn(evt){
    evt.preventDefault();
    //get data from sign in form
    let data =new FormData(evt.target);
    let email = data.get('email');
    let password = data.get('password');
    evt.target.reset();
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(
        function(){
            let userid = firebase.auth().currentUser.uid;
            let path = 'users/' + userid;
            firebase.database()
            .ref(path)
            .once('value')
            .then(
                function(snapshot){
                    let username = snapshot.val().name;
                    app.username = username;
                    displayUserName(username);
                }
            )
        }
    )
    .catch(
        function(error) {
            console.log(error.message);
        }
    );
}

function signUserUp(evt){
    //stop page refreshing
    evt.preventDefault();
    let data = new FormData(evt.target);
    let username = data.get('username');
    let email = data.get('email');
    let password = data.get('password');
    evt.target.reset();
    //send data to firebase
    firebase.auth().createUserWithEmailAndPassword(email,password)
    .then(
        function(){
            let userid = firebase.auth().currentUser.uid;
            let path = 'users/' + userid;
            let obj = {name: username};
            firebase.database()
                .ref(path)
                .set(obj)
                .then( function(result){
                    //nothing yet
                    //user is now signed up and is logged in
                    //display username
                    displayUserName(username);
                }
            );
        }
    )
    .catch(
        function(error){
            console.log("account creation failed");
        }
    )
    
}

function removeDone(){
    let count = TaskArray.length-1;
    for(let i=count; i>=0; i--){
        let item = TaskArray[i];
        if(item.status == 1){
            //splice removes item from array
            TaskArray.splice(i,1);
            let taskid = item.id;
            let userid = app.userid;
            let path = 'lists/' + userid + '/' + taskid;
            firebase.database().ref(path).remove().then(function(response){
                    
            });
            // saveTasks();
             renderTaskList();
        }
    }
    toggleShowButton();
}

function onSubmit(event){
    //cancel event default
    event.preventDefault();
    const TaskInput = document.getElementById('task-input');
    let taskname = TaskInput.value;
    if(taskname != ''){
        let todo = new Task(taskname);
        TaskArray.push(todo);
        saveTasks();
        event.target.reset();
        renderTaskList();
    }
}

function createNewTask(taskobj){
    //create an LI element
    let listitem = document.createElement('LI');
    //set attributes to the LI
    listitem.setAttribute('id',taskobj.id);
    listitem.setAttribute('data-status',taskobj.status);
    let txt = document.createTextNode(taskobj.name);
    listitem.appendChild(txt);
    document.getElementById('task-list').appendChild(listitem);
    writeTask(app.userid,taskobj);
}

function writeTask(userid,task){
    if(app.userid){
        let path = 'lists/' + userid + '/' + task.id;
        let taskobj = {name: task.name, status: task.status};
        firebase.database().ref(path).set(taskobj);
    }
}

function readTask(userid){
    let path = 'lists/' + userid;
    firebase.database()
        .ref(path)
        .once('value')
        .then(
           function(snapshot){
               let tasks = snapshot.val();
               let count = Object.keys(tasks).length;
               let keys = Object.keys(tasks);
               console.log(count);
               for(let i=0; i<count; i++){
                   let item = tasks[ keys[i] ];
                   let name = item.name;
                   let status = item.status;
                   let id = keys[i];
                   let task = {id: id, name: name, status: status};
                   
                   //add to Task array
                   TaskArray.push(task);
                   renderTaskList();
               }
           } 
        );
}

function clearTaskList(){
    document.getElementById('task-list').innerHTML = '';
}

function renderTaskList(){
    let count = TaskArray.length;
    clearTaskList();
    for(let i=0; i < count; i++){
        let taskobj = TaskArray[i];
        createNewTask(taskobj);
    }
    toggleShowButton();
}

function changeTaskStatus(event){
    //console.log(event.target);
    let itemid = event.target.id;
    //search the array for the itemid
    let count = TaskArray.length;
    //loop through array
    for(let i=0; i < count; i++){
        let taskobj = TaskArray[i];
        if(taskobj.id == itemid){
            switch(taskobj.status){
                case 0:
                    taskobj.status = 1;
                    break;
                case 1:
                    taskobj.status = 0;
                    break;
                default:
                    break;
            }
            saveTasks();
            renderTaskList();
        }
    }
}

function saveTasks(){
    // if(window.localStorage){
    //     let jsonstring = JSON.stringify(TaskArray);
    //     window.localStorage.setItem('tasks',jsonstring);
    // }
}

function loadTasks(){
    // if(window.localStorage){
    //     let data = window.localStorage.getItem('tasks');
    //     if(JSON.parse(data)){
    //         TaskArray = JSON.parse(data);
    //         renderTaskList();
    //     }
    // }
}

function toggleShowButton(){
    let show = false;
    let count = TaskArray.length;
    //loop through the array to find items with status=1
    for(let i=0; i<count; i++){
        let item = TaskArray[i];
        if(item.status == 1){
            show = true;
        }
    }
    if(show == true){
        document.getElementById('remove').setAttribute('class','show');
    }
    else{
        document.getElementById('remove').removeAttribute('class');
    }
}

//function to show a particular form
function showForm(formid){
    //get a reference to both forms
    let forms = document.querySelectorAll('.overlay');
    //iterate through result and set each to have display:none
    for(let i=0; i < forms.length; i++){
        forms[i].style.opacity = '0';
        forms[i].style.display = 'none';
        if(forms[i].getAttribute('id') == formid){
            forms[i].style.opacity = '0';
            forms[i].style.display = 'flex';
            forms[i].style.opacity = '1';
        }
    }
}