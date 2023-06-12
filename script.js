const apikey = '2a464f37-2e60-4f49-aea1-648c222230b3'; // can generate at: https://todo-api.coderslab.pl/apikey/create 
const apihost = 'https://todo-api.coderslab.pl';

document.addEventListener('DOMContentLoaded', function() {
    apiListTasks().then(
        function (response) {
            // response return a object with key "error" and "data"
            // data is table with object-task
            // we run function renderTask for each task from backend-api
            response.data.forEach( 
                function(task)  { 
                    renderTask(task.id, task.title, task.description, task.status);
                    }
                ); 
            
        }
    )
    document.querySelector(".js-task-adding-form").addEventListener('submit', function (event) {
        event.preventDefault();
        // event.target is element of <form>
        // .elements give opurtunitie to ask form of his field (using 'name' atribiutes)
        apiCreateTask(event.target.elements.title.value, 
            event.target.elements.description.value
            ).then(
            function(response) {renderTask(response.data.id, response.data.title, 
                response.data.description, response.data.status);}
        )
    });
});

function apiListTasks() {
    return fetch(
        apihost +'/api/tasks',
        {
            headers: { 'Authorization': apikey }
        }
    ).then(
        function (resp) {
            if (!resp.ok) {
                alert('Error! Open devtools, find Network tab and look what goes work ');
            }
            return resp.json();
        }
    )
};

function apiListOperationsForTask(taskId) {
    return fetch(
      apihost + '/api/tasks/' + taskId + '/operations',
      { 
        headers: { 'Authorization': apikey } 
    }
    ).then(
      function (resp) {
        if(!resp.ok) {
          alert('Error! Open devtools, find Network tab and look what goes work ');
        }
        return resp.json();
      }
    );
};

function formatTime(timeSpent) {
  const hours = Math.floor(timeSpent / 60);
  const minutes = timeSpent % 60;

    if(hours > 0) {
        return hours + 'h ' + minutes;
    } else {
        return minutes;
    }
};

function renderTask(taskId, title, description, status) {
    const section = document.createElement('section');
    section.className = 'card mt-5 shadow-sm';
    document.querySelector('main').appendChild(section);

    const headerDiv = document.createElement('div');
    headerDiv.className = 'card-header d-flex justify-content-between align-items-center';
    section.appendChild(headerDiv);

    const headerLeftDiv = document.createElement('div');
    headerDiv.appendChild(headerLeftDiv);

    const h5 = document.createElement('h5');
    h5.innerText = title;
    headerLeftDiv.appendChild(h5);

    const h6 = document.createElement('h6');
    h6.className = 'card-subtitle text-muted';
    h6.innerText = description;
    headerLeftDiv.appendChild(h6);

    const headerRightDiv = document.createElement('div');
    headerDiv.appendChild(headerRightDiv);

    if (status == "open") {
        const finishButton = document.createElement('button');
        finishButton.className = 'btn btn-dark btn-sm js-task-open-only';
        finishButton.innerText = 'Finish';
        headerRightDiv.appendChild(finishButton);
    }

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
    deleteButton.innerText = 'Delete';
    headerRightDiv.appendChild(deleteButton);
    deleteButton.addEventListener('click', function(){
        apiDeleteTask(taskId);
        section.remove();
    })

    const ul = document.createElement('ul');
    ul.className = 'list-group list-group-flush';
    section.appendChild(ul);

    apiListOperationsForTask(taskId).then(
        function (response) {
            response.data.forEach(
                function (operation) { renderOperation(ul, status, operation.id,
                    operation.description, formatTime(operation.timeSpent));
                }
            )
        }
    )

    const divForm = document.createElement('div');
    divForm.className = 'card-body';
    section.appendChild(divForm);

    const form = document.createElement('form');
    divForm.appendChild(form);

    const divFormInput = document.createElement('div');
    divFormInput.className = 'input-group';
    form.appendChild(divFormInput);

    const divButtonAdd = document.createElement('div');
    divButtonAdd.className = 'input-group-append';
    divFormInput.appendChild(divButtonAdd);

    const buttonAdd = document.createElement('button');
    buttonAdd.className = 'btn btn-info';
    buttonAdd.innerText = 'Add';
    divButtonAdd.appendChild(buttonAdd);

    const inputOpperation = document.createElement('input');
    inputOpperation.type = 'text';
    inputOpperation.placeholder = 'Operation description';
    inputOpperation.className = 'form-control';
    inputOpperation.minlength = '5';
    divFormInput.appendChild(inputOpperation);

    form.addEventListener('submit', function(event){
        event.preventDefault();
        apiCreateOperationForTask(taskId, inputOpperation.value).then(
            function(response){
                renderOperation(
                    ul,
                    status,
                    response.data.id,
                    response.data.description,
                    response.data.timeSpent
                )
            }
        )
    })

};

function renderOperation(ul, status, operationId, operationDescription, timeSpent) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    ul.appendChild(li);
    
    const descriptionDiv = document.createElement('div');
    descriptionDiv.innerText = operationDescription;
    li.appendChild(descriptionDiv);

    const time = document.createElement('span');
    time.className = 'badge badge-success badge-pill ml-2';
    time.innerText = timeSpent + 'm';
    descriptionDiv.appendChild(time);

    if (status == "open") {
        const buttonDiv = document.createElement('div');
        buttonDiv.className = 'js-task-open-only';
        li.appendChild(buttonDiv);

        const button15m = document.createElement('button');
        button15m.className = 'btn btn-outline-success btn-sm mr-2';
        button15m.innerText = '+15m';
        buttonDiv.appendChild(button15m);
        button15m.addEventListener('click', function() {
            apiUpdateOperation(operationId, operationDescription, timeSpent + 15).then(
              function(response) {
                time.innerText = formatTime(response.data.timeSpent);
                timeSpent = response.data.timeSpent;
              }
            );
          });
        
        const button1h = document.createElement('button');
        button1h.className = 'btn btn-outline-success btn-sm mr-2';
        button1h.innerText = '+1h';
        buttonDiv.appendChild(button1h);
        button1h.addEventListener('click', function() {
            apiUpdateOperation(operationId, operationDescription, timeSpent + 60).then(
              function(response) {
                time.innerText = formatTime(response.data.timeSpent);
                timeSpent = response.data.timeSpent;
              }
            );
          });

        const buttonDelete = document.createElement('button');
        buttonDelete.className = 'btn btn-outline-danger btn-sm';
        buttonDelete.innerText = 'Delete';
        buttonDiv.appendChild(buttonDelete);
    }

};

function apiCreateTask(title, description) {
    return fetch(
        apihost + '/api/tasks',
        {
            headers: { Authorization: apikey, 'Content-Type': 'application/json'},
            body: JSON.stringify({title: title, description: description, status: 'open'}),
            method: 'POST',
        }
    ).then(
        function(resp){
            if (!resp.ok) {
                alert('Error! Open devtools, find Network tab and look what goes work');
            }
            return resp.json();
        }
    )
};

function apiDeleteTask(taskId) {
    return fetch(
        apihost + '/api/tasks/' + taskId,
        {
            headers: {Authorization: apikey},
            method: 'DELETE'
        }
    ).then(
        function (resp) {
            if(!resp.ok) {
                alert('Error! Open devtools, find Network tab and look what goes work');
            }
            return resp.json();
        }

    )

};

function apiCreateOperationForTask(taskId, description){
    return fetch(
        apihost + '/api/tasks/' +taskId +'/operations',
        {
            headers: { Authorization: apikey, 'Content-Type': 'application/json'},
            body: JSON.stringify({description: description, timeSpent: 0}),
            method: 'POST',
        }
    ).then(
        function(resp){
            if (!resp.ok) {
                alert('Error! Open devtools, find Network tab and look what goes work');
            }
            return resp.json();
        }
    )
};

function apiUpdateOperation(operationId, description, timeSpent) {
    return fetch(
      apihost + '/api/operations/' + operationId,
      {
        headers: { Authorization: apikey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description, timeSpent: timeSpent }),
        method: 'PUT'
      }
    ).then(
      function (resp) {
        if(!resp.ok) {
          alert('Error! Open devtools, find Network tab and look what goes work');
        }
        return resp.json();
      }
    );
};