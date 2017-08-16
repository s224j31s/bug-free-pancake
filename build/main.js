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

window.addEventListener('load',function(){
    loadTasks();
    const TaskForm = document.getElementById('task-form');
    //add a listener for when form is submitted
    TaskForm.addEventListener('submit',onSubmit);
    //get a reference to task-list element
    const TaskList = document.getElementById('task-list');
    TaskList.addEventListener('click',changeTaskStatus);
});

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
    if(window.localStorage){
        let jsonstring = JSON.stringify(TaskArray);
        window.localStorage.setItem('tasks',jsonstring);
    }
}

function loadTasks(){
    if(window.localStorage){
        let data = window.localStorage.getItem('tasks');
        if(JSON.parse(data)){
            TaskArray = JSON.parse(data);
            renderTaskList();
        }
    }
}