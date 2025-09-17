// Calendar and Event Manager

// Global state
const state = {
    events: [],
    eventIdCounter: 1,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear()
};

// Constants
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TODAY = new Date();

// DOM Elements
const elements = {
    eventDate: document.getElementById("eventDate"),
    eventTitle: document.getElementById("eventTitle"),
    eventDescription: document.getElementById("eventDescription"),
    reminderList: document.getElementById("reminderList"),
    selectYear: document.getElementById("year"),
    selectMonth: document.getElementById("month"),
    calendarBody: document.getElementById("calendar-body"),
    monthAndYear: document.getElementById("monthAndYear"),
    theadMonth: document.getElementById("thead-month"),
    calendar: document.getElementById("calendar")
};

// Initialize year selection
function initializeYearSelect(start = 1970, end = 2050) {
    let yearOptions = "";
    for (let year = start; year <= end; year++) {
        yearOptions += `<option value='${year}'>${year}</option>`;
    }
    elements.selectYear.innerHTML = yearOptions;
    elements.selectYear.value = state.currentYear;
}

// Initialize calendar header
function initializeCalendarHeader() {
    let headerRow = "<tr>";
    DAYS.forEach(day => {
        headerRow += `<th data-days='${day}'>${day}</th>`;
    });
    headerRow += "</tr>";
    elements.theadMonth.innerHTML = headerRow;
}

// Event Management
function addEvent() {
    const date = elements.eventDate.value;
    const title = elements.eventTitle.value;
    const description = elements.eventDescription.value;

    if (date && title) {
        state.events.push({
            id: state.eventIdCounter++,
            date,
            title,
            description
        });
        
        clearEventInputs();
        showCalendar(state.currentMonth, state.currentYear);
    }
}

function deleteEvent(eventId) {
    const eventIndex = state.events.findIndex(event => event.id === eventId);
    if (eventIndex !== -1) {
        state.events.splice(eventIndex, 1);
        showCalendar(state.currentMonth, state.currentYear);
    }
}

function clearEventInputs() {
    elements.eventDate.value = "";
    elements.eventTitle.value = "";
    elements.eventDescription.value = "";
}

function displayReminders() {
    elements.reminderList.innerHTML = "";
    state.events.forEach(event => {
        const eventDate = new Date(event.date);
        if (eventDate.getMonth() === state.currentMonth && 
            eventDate.getFullYear() === state.currentYear) {
            const listItem = document.createElement("li");
            listItem.innerHTML = `<strong>${event.title}</strong> - ${event.description} on ${eventDate.toLocaleDateString()}`;

            const deleteButton = document.createElement("button");
            deleteButton.className = "delete-event";
            deleteButton.textContent = "Delete";
            deleteButton.onclick = () => deleteEvent(event.id);

            listItem.appendChild(deleteButton);
            elements.reminderList.appendChild(listItem);
        }
    });
}

// Calendar Navigation
function next() {
    state.currentYear = state.currentMonth === 11 ? state.currentYear + 1 : state.currentYear;
    state.currentMonth = (state.currentMonth + 1) % 12;
    showCalendar(state.currentMonth, state.currentYear);
}

function previous() {
    state.currentYear = state.currentMonth === 0 ? state.currentYear - 1 : state.currentYear;
    state.currentMonth = state.currentMonth === 0 ? 11 : state.currentMonth - 1;
    showCalendar(state.currentMonth, state.currentYear);
}

function jump() {
    state.currentYear = parseInt(elements.selectYear.value);
    state.currentMonth = parseInt(elements.selectMonth.value);
    showCalendar(state.currentMonth, state.currentYear);
}

// Calendar Display
function showCalendar(month, year) {
    const firstDay = new Date(year, month, 1).getDay();
    elements.calendarBody.innerHTML = "";
    elements.monthAndYear.innerHTML = `${MONTHS[month]} ${year}`;
    elements.selectYear.value = year;
    elements.selectMonth.value = month;

    let date = 1;
    for (let i = 0; i < 6; i++) {
        const row = document.createElement("tr");
        for (let j = 0; j < 7; j++) {
            const cell = document.createElement("td");
            
            if (i === 0 && j < firstDay) {
                cell.appendChild(document.createTextNode(""));
            } else if (date > daysInMonth(month, year)) {
                break;
            } else {
                cell.setAttribute("data-date", date);
                cell.setAttribute("data-month", month + 1);
                cell.setAttribute("data-year", year);
                cell.setAttribute("data-month_name", MONTHS[month]);
                cell.className = "date-picker";
                cell.innerHTML = `<span>${date}</span>`;

                if (date === TODAY.getDate() && year === TODAY.getFullYear() && month === TODAY.getMonth()) {
                    cell.className = "date-picker selected";
                }

                if (hasEventOnDate(date, month, year)) {
                    cell.classList.add("event-marker");
                    cell.appendChild(createEventTooltip(date, month, year));
                }
                date++;
            }
            row.appendChild(cell);
        }
        elements.calendarBody.appendChild(row);
    }
    displayReminders();
}

function createEventTooltip(date, month, year) {
    const tooltip = document.createElement("div");
    tooltip.className = "event-tooltip";
    
    const eventsOnDate = getEventsOnDate(date, month, year);
    eventsOnDate.forEach(event => {
        const eventDate = new Date(event.date);
        const eventElement = document.createElement("p");
        eventElement.innerHTML = `<strong>${event.title}</strong> - ${event.description} on ${eventDate.toLocaleDateString()}`;
        tooltip.appendChild(eventElement);
    });
    
    return tooltip;
}

// Utility Functions
function getEventsOnDate(date, month, year) {
    return state.events.filter(event => {
        const eventDate = new Date(event.date);
        return (
            eventDate.getDate() === date &&
            eventDate.getMonth() === month &&
            eventDate.getFullYear() === year
        );
    });
}

function hasEventOnDate(date, month, year) {
    return getEventsOnDate(date, month, year).length > 0;
}

function daysInMonth(month, year) {
    return 32 - new Date(year, month, 32).getDate();
}

// Initialize Calendar
document.addEventListener('DOMContentLoaded', () => {
    initializeYearSelect();
    initializeCalendarHeader();
    showCalendar(state.currentMonth, state.currentYear);
    
    // Attach event listeners
    document.getElementById("next").onclick = next;
    document.getElementById("previous").onclick = previous;
    document.getElementById("jump").onclick = jump;
    document.getElementById("addEventBtn").onclick = addEvent;
});