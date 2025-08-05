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
  createTicket(t.task, t.priorityColor, t.ticketID);
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
    const selectedColor = colorBox.classList[0];
    const filtered = tickets.filter((t) => t.priorityColor === selectedColor);
    renderFilteredTickets(filtered);
  });
});

function renderFilteredTickets(filtered) {
  mainCont.innerHTML = "";
  filtered.forEach((t) => {
    createTicket(t.task, t.priorityColor, t.ticketID);
  });
}

function createTicket(task, priorityColor, ticketID) {
  const id = ticketID || shortid();
  const ticketCont = document.createElement("div");
  ticketCont.className = "ticket-cont";

  ticketCont.innerHTML = `
    <div class="ticket-color ${priorityColor}"></div>
    <div class="ticket-id">#${id}</div>
    <div class="task-area" contenteditable="${!isLocked}">${task}</div>
    <div class="ticket-lock">
      <i class="fa-solid fa-lock"></i>
    </div>
    <div class="ticket-remove">
      <i class="fa-solid fa-xmark"></i>
    </div>
  `;

  mainCont.appendChild(ticketCont);

  if (!ticketID) {
    tickets.push({ task, priorityColor, ticketID: id });
    localStorage.setItem("tickets", JSON.stringify(tickets));
  }

  const lockIcon = ticketCont.querySelector(".ticket-lock i");
  const taskElem = ticketCont.querySelector(".task-area");
  const removeBtn = ticketCont.querySelector(".ticket-remove");

  lockIcon.addEventListener("click", () => {
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
