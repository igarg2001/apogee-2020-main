const REGISTRATIONS_URL = 'https://bits-apogee.org/registrations/Register/';
const COLLEGE_URL = 'https://bits-apogee.org/registrations/get_college';
const EVENT_URL = 'https://bits-apogee.org/registrations/events';

const SELECTED_EVENTS = [];
const noEventMessage = document.getElementById('no-event-message');
const selectedEventsContainer = document.getElementsByClassName('selected-events-container')[0];

const getCollegesList = () => {
    fetch(COLLEGE_URL).then(data => {
        return data.json();
    }).then(response => {
        document.getElementsByTagName('datalist')[0].removeChild(document.getElementById('loadingCollege'));

        response.data.map(college => {
            const option = document.createElement('option');
            option.value = college.name;
            option.id = college.id;
            option.innerHTML = college.name;
            document.getElementById('college_input').appendChild(option);
        });
    }, console.error);
}

const getEventsList = () => {
    fetch(EVENT_URL).then(data => {
        return data.json()
    }).then(response => {
        document.getElementsByTagName('datalist')[1].removeChild(document.getElementById('loadingEvent'));
        response.data.map(category => {
            if (category.category_name === 'Registration')
                category.events.map(event => {
                    const option = document.createElement("option");
                    option.value = event.name;
                    option.id = event.id;
                    option.innerHTML = event.name;
                    document.getElementById('event_input').appendChild(option);
                })
        })
    }, console.error) 
}

const handleEventClick = (e) => {
    const input = e.target;
    const eventName = input.value;
    e.target.value = "";
    // e.target.blur();
    const list = input.getAttribute('list');
    const options = document.getElementById(list).childNodes;

    const eventTag = document.createElement("div");
    eventTag.classList.add("selected-events");
    eventTag.innerHTML = eventName;

    const removeButton = document.createElement("img");
    removeButton.src = "assets/icons/red-close.png";
    removeButton.alt = "Remove";

    for(var i = 0; i < options.length; i++) {
        if(options[i].innerText === eventName) {
            SELECTED_EVENTS.push(parseInt(options[i].id));
            options[i].disabled = true;
            const that = options[i];
            removeButton.onclick = (e) => {
                e.target.parentNode.remove();
                for (let i = 0; i < SELECTED_EVENTS.length; i++) {
                    if (SELECTED_EVENTS[i] == that.id) {
                        SELECTED_EVENTS.splice(i, 1);
                    }
                    if (SELECTED_EVENTS.length === 0) {
                        noEventMessage.style.display = 'initial';
                        selectedEventsContainer.style.border = '3px solid #0fffff';
                    }
                }
                that.disabled = false;
            }
        }
    }

    eventTag.appendChild(removeButton);
    document.getElementsByClassName("selected-events-container")[0].appendChild(eventTag);

    if (SELECTED_EVENTS.length === 0) {
        noEventMessage.style.display = 'initial';
        selectedEventsContainer.style.border = '3px solid #0fffff';
    }
    if (SELECTED_EVENTS.length !== 0) {
        noEventMessage.style.display = 'none';
        selectedEventsContainer.style.border = '3px solid #b02c8d';
    }
}

document.querySelector('input[list="event_input"]').addEventListener('input', handleEventClick)

const getCollegeId = () => {
    const input = document.getElementById('college');
    const val = input.value;
    const options = document.getElementById('college_input').childNodes;

    for(let i = 0; i < options.length; i++) {
        if(options[i].innerText === val) {
            return options[i].id;
        }
    }

    if (val) {
        return '%NOT_FOUND%';
    }
}


const showMessage = (msg) => {
    const messageBox = document.getElementsByClassName('message-box')[0];
    messageBox.style.display = 'initial';
    document.getElementById('message').innerHTML = msg;
    messageBox.style.animation = 'slideIn 0.5s';
    setTimeout(() => {
        messageBox.style.animation = 'none';
    }, 500);
}

const closeMessage = () => {
    const messageBox = document.getElementsByClassName('message-box')[0];
    messageBox.style.animation = 'slideOut 0.5s';
    setTimeout(() => {
        document.getElementById('message').innerHTML = '';
        messageBox.style.animation = 'none';
        messageBox.style.display = 'none';
    }, 500);
}


const form = document.getElementsByTagName('form')[0];

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const data = new FormData(form);
    const body = {};
    for (const entry of data) {
        body[entry[0]] = entry[1];
    };

    body.college_id = parseInt(getCollegeId());
    body.year = parseInt(body.year);

    if(!body.gender || !body.year || !body.college_id) {
        showMessage('Incomplete form data! Please fill all the required fields.');
        return;
    }

    if (body.college_id == '%NOT_FOUND%') {
        showMessage('Invalid college name! Please select one from the list, if not found contact- PCr (+91-7838773681).');
        return;
    }

    if (!body.referral) {
        //remove referral field from body if left empty
        delete body.referral;
    }

    body.events = SELECTED_EVENTS;

    const params = {
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        method: "POST"
    }

    fetch(REGISTRATIONS_URL, params).then(data => {
        return data.json();
    }).then(response => {
        if (response.message) {
            showMessage(response.message);
            return;
        }
        showMessage('Registration successfull!');
        // toogleRegisterForm();
    }).catch(error => {
        showMessage("ERROR: " + error + '\n Contact administrator');
    });

}, false);

function showData(id) {
    const eOpts = document.querySelectorAll('#' + id + ' > option');
    for(i = 0; i < eOpts.length; i++) {
        eOpts[i].style.display = 'block';
    }
}

window.onload = () => {
    getCollegesList();
    getEventsList();
}