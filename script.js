// Select DOM elements
const addBtn = document.querySelector(".add-btn");
const modalCont = document.querySelector(".modal-cont");
const taskArea = document.querySelector(".textArea-cont");
const mainCont = document.querySelector(".main-cont");
const allPriorityColors = document.querySelectorAll(".priority-color");
const toolBoxPriorityColors = document.querySelectorAll(".color");

let modalVisible = false;
let isLocked = true;
let selectedPriorityColor = "lightblue";

// LocalStorage tasks
let tickets = localStorage.getItem("tickets")
  ? JSON.parse(localStorage.getItem("tickets"))
  : [];

// Load all existing tickets
for (let t of tickets) {
  createTicket(t.task, t.priorityColor, t.ticketID, t.createdAt);
}

// Toggle modal
addBtn.addEventListener("click", () => {
  modalVisible = !modalVisible;
  modalCont.style.display = modalVisible ? "flex" : "none";
});

// Priority color select
allPriorityColors.forEach((colorElem) => {
  colorElem.addEventListener("click", () => {
    allPriorityColors.forEach((c) => c.classList.remove("active"));
    colorElem.classList.add("active");
    selectedPriorityColor = colorElem.classList[0];
  });
});

// Create ticket on Enter
modalCont.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && taskArea.value.trim() !== "") {
    createTicket(taskArea.value, selectedPriorityColor);
    taskArea.value = "";
    modalVisible = false;
    modalCont.style.display = "none";
  }
});

// Filter tickets by color
toolBoxPriorityColors.forEach((colorBox) => {
  colorBox.addEventListener("click", () => {
    const color = colorBox.classList[0]; // e.g., "lightblue"
    mainCont.innerHTML = ""; // Clear all tickets before showing filtered ones

    tickets
      .filter((t) => t.priorityColor === color)
      .forEach((t) => {
        createTicket(t.task, t.priorityColor, t.ticketID, t.createdAt);
      });
  });
});

function createTicket(task, priorityColor, ticketID, createdAt) {
  const id = ticketID || shortid();
  const now = createdAt || new Date().toISOString();
  const dateObj = new Date(now);
  const formattedDate = dateObj.toLocaleDateString();
  const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const ticketCont = document.createElement("div");
  ticketCont.className = `ticket-cont ${priorityColor}`;

  ticketCont.innerHTML = `
    <div class="ticket-controls">
      <button class="ticket-done" title="Mark as Done"><i class="fa-solid fa-check"></i></button>
      <button class="ticket-lock" title="Lock/Unlock"><i class="fa-solid fa-lock"></i></button>
    </div>
    <div class="ticket-id">#${id}</div>
    <div class="ticket-date"><i class="fa-regular fa-clock"></i> ${formattedDate} ${formattedTime}</div>
    <div class="task-area" contenteditable="${!isLocked}">${task}</div>
    <button class="ticket-remove" title="Remove"><i class="fa-solid fa-xmark"></i></button>
  `;

  mainCont.appendChild(ticketCont);

  if (!ticketID) {
    tickets.push({ task, priorityColor, ticketID: id, createdAt: now });
    localStorage.setItem("tickets", JSON.stringify(tickets));
  }

  const lockBtn = ticketCont.querySelector(".ticket-lock");
  const lockIcon = lockBtn.querySelector("i");
  const taskElem = ticketCont.querySelector(".task-area");
  const removeBtn = ticketCont.querySelector(".ticket-remove");
  const doneBtn = ticketCont.querySelector(".ticket-done");

  lockBtn.addEventListener("click", () => {
    isLocked = !isLocked;
    taskElem.setAttribute("contenteditable", !isLocked);
    lockIcon.classList.toggle("fa-lock-open");
    lockIcon.classList.toggle("fa-lock");
  });

  removeBtn.addEventListener("click", () => {
    if (!isLocked) {
      ticketCont.remove();
      tickets = tickets.filter((t) => t.ticketID !== id);
      localStorage.setItem("tickets", JSON.stringify(tickets));
    }
  });

  doneBtn.addEventListener("click", () => {
    ticketCont.remove();
    tickets = tickets.filter((t) => t.ticketID !== id);
    localStorage.setItem("tickets", JSON.stringify(tickets));
  });

  // Color cycling feature
  const ticketColorElem = ticketCont.querySelector(".ticket-color");
  ticketColorElem.addEventListener("click", () => {
    const colors = ["lightblue", "lightgreen", "lightpink", "black"];
    let currIndex = colors.indexOf(ticketColorElem.classList[1]);
    let newIndex = (currIndex + 1) % colors.length;
    ticketColorElem.classList.remove(colors[currIndex]);
    ticketColorElem.classList.add(colors[newIndex]);

    const ticket = tickets.find((t) => t.ticketID === id);
    if (ticket) {
      ticket.priorityColor = colors[newIndex];
      localStorage.setItem("tickets", JSON.stringify(tickets));
    }
  });
}

// Show all tickets when TaskFlow brand is clicked
document.querySelector('.brand-title').addEventListener('click', () => {
  mainCont.innerHTML = "";
  tickets.forEach((t) => {
    createTicket(t.task, t.priorityColor, t.ticketID, t.createdAt);
  });
});
