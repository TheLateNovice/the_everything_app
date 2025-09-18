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
let elements = {
    eventDate: null,
    eventDateDisplay: null,
    eventTitle: null,
    eventDescription: null,
    reminderList: null,
    selectYear: null,
    selectMonth: null,
    calendarBody: null,
    monthAndYear: null,
    theadMonth: null,
    calendar: null
};

// Initialize DOM elements after the document is loaded
function initializeElements() {
    elements = {
        eventDate: document.getElementById("eventDate"),
        eventDateDisplay: document.getElementById("eventDateDisplay"),
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

    // Add click handler to the display input to show date picker
    if (elements.eventDateDisplay) {
        elements.eventDateDisplay.addEventListener('click', function() {
            elements.eventDate.showPicker();
        });
    }

    // Add change handler for the date input to update display
    if (elements.eventDate) {
        elements.eventDate.addEventListener('change', function() {
            if (elements.eventDateDisplay && this.value) {
                const date = new Date(this.value);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                elements.eventDateDisplay.value = `${day}/${month}/${year}`;
            }
        });
    }
}

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
        // Create new event
        const newEvent = {
            id: state.eventIdCounter++,
            date,
            title,
            description
        };
        
        // Add new event to the array
        state.events.push(newEvent);
        
        // Clear inputs and refresh calendar
        clearEventInputs();
        showCalendar(state.currentMonth, state.currentYear);
        
        // Get the date parts to update the correct month view
        const eventDate = new Date(date);
        const eventMonth = eventDate.getMonth();
        const eventYear = eventDate.getFullYear();
        
        // If the event is for a different month, navigate to that month
        if (eventMonth !== state.currentMonth || eventYear !== state.currentYear) {
            state.currentMonth = eventMonth;
            state.currentYear = eventYear;
            showCalendar(state.currentMonth, state.currentYear);
        }
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
    
    // Get current month events and sort them by date
    const currentMonthEvents = state.events
        .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getMonth() === state.currentMonth && 
                   eventDate.getFullYear() === state.currentYear;
        })
        .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });

    currentMonthEvents.forEach(event => {
        const eventDate = new Date(event.date);
        const day = String(eventDate.getDate()).padStart(2, '0');
        const month = String(eventDate.getMonth() + 1).padStart(2, '0');
        const year = eventDate.getFullYear();
        const formattedDate = `${day}/${month}/${year}`;
        
        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <div class="reminder-content">
                <div class="reminder-date">${formattedDate}</div>
                <div class="reminder-title">${event.title}</div>
                <div class="reminder-description">${event.description}</div>
            </div>
        `;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-event";
        deleteButton.innerHTML = "&times;";
        deleteButton.title = "Delete reminder";
        deleteButton.onclick = () => deleteEvent(event.id);

        listItem.appendChild(deleteButton);
        elements.reminderList.appendChild(listItem);
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
    if (!elements.calendarBody) {
        console.error('Calendar body element not found');
        return;
    }

    try {
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

                    cell.className = "date-picker";
                    
                    if (date === TODAY.getDate() && year === TODAY.getFullYear() && month === TODAY.getMonth()) {
                        cell.classList.add("selected");
                    }

                    const eventsOnDate = getEventsOnDate(date, month, year);
                    if (eventsOnDate.length > 0) {
                        cell.classList.add("event-marker");
                        if (date === TODAY.getDate() && year === TODAY.getFullYear() && month === TODAY.getMonth()) {
                            cell.classList.add("selected");
                        }
                        
                        // Create dots container
                        const dotsContainer = document.createElement("div");
                        dotsContainer.className = "event-dots";
                        
                        // Add a dot for each event (up to 3 dots)
                        const numDots = Math.min(eventsOnDate.length, 3);
                        for (let i = 0; i < numDots; i++) {
                            const dot = document.createElement("span");
                            dot.className = "event-dot";
                            dot.textContent = "•";
                            dotsContainer.appendChild(dot);
                        }
                        
                        cell.appendChild(dotsContainer);
                        cell.appendChild(createEventTooltip(date, month, year));
                    }

                    // Create a closure to preserve the current values
                    const currentDate = date;
                    cell.addEventListener('click', function() {
                        handleDateSelection(currentDate, month, year);
                    });
                    
                    date++;
                }
                row.appendChild(cell);
            }
            elements.calendarBody.appendChild(row);
        }
        displayReminders();
    } catch (error) {
        console.error('Error displaying calendar:', error);
    }
}

function createEventTooltip(date, month, year) {
    const tooltip = document.createElement("div");
    tooltip.className = "event-tooltip";
    
    const eventsOnDate = getEventsOnDate(date, month, year);
    eventsOnDate.forEach(event => {
        const eventDate = new Date(event.date);
        const eventElement = document.createElement("p");
        eventElement.innerHTML = `<strong>${event.title}</strong> ${event.description} on ${eventDate.toLocaleDateString()}`;
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

// Handle date selection when a calendar date is clicked
function handleDateSelection(date, month, year) {
    try {
        // Create a Date object to validate the date
        const selectedDate = new Date(year, month, date);
        
        // Check if the date is valid
        if (selectedDate.getFullYear() !== year || 
            selectedDate.getMonth() !== month || 
            selectedDate.getDate() !== date) {
            throw new Error('Invalid date');
        }
        
        // Format the date to YYYY-MM-DD
        const formattedMonth = String(month + 1).padStart(2, '0');
        const formattedDate = String(date).padStart(2, '0');
        const formattedYear = String(year);
        
        const dateString = `${formattedYear}-${formattedMonth}-${formattedDate}`;
        
        if (elements.eventDate) {
            // Set the value and dispatch an input event to ensure proper updating
            elements.eventDate.value = dateString;
            elements.eventDate.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Update the display field with formatted date (DD/MM/YYYY)
            if (elements.eventDateDisplay) {
                const displayDate = `${formattedDate}/${formattedMonth}/${formattedYear}`;
                elements.eventDateDisplay.value = displayDate;
            }
            
            // Scroll to the event form
            const eventSection = document.getElementById('event-section');
            if (eventSection) {
                eventSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
            // Focus on the title input after a short delay
            if (elements.eventTitle) {
                setTimeout(() => {
                    elements.eventTitle.focus();
                }, 500);
            }
        }
    } catch (error) {
        console.error('Error setting date:', error);
    }
}

// Initialize Calendar
function initializeCalendar() {
    // Initialize DOM elements first
    initializeElements();
    
    // Only proceed if elements were properly initialized
    if (elements.calendarBody) {
        initializeYearSelect();
        initializeCalendarHeader();
        showCalendar(state.currentMonth, state.currentYear);
        
        // Attach event listeners
        document.getElementById("next").onclick = next;
        document.getElementById("previous").onclick = previous;
        document.getElementById("jump").onclick = jump;
        document.getElementById("addEventBtn").onclick = addEvent;
    } else {
        console.error('Calendar elements not found. Retrying in 100ms...');
        setTimeout(initializeCalendar, 100);
    }
}

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeCalendar);