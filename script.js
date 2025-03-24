document.getElementById("algorithm").addEventListener("change", function() {
    document.getElementById("timeQuantum").style.display = (this.value === "rr") ? "inline-block" : "none";
});

function parseInput() {
    let input = document.getElementById("processInput").value.trim();
    let lines = input.split("\n");
    let processes = [];

    for (let line of lines) {
        let parts = line.split(",");
        if (parts.length !== 3) {
            alert("Invalid input format! Use: PID,Arrival,Burst");
            return [];
        }
        processes.push({
            pid: parseInt(parts[0]),
            arrivalTime: parseInt(parts[1]),
            burstTime: parseInt(parts[2]),
            remainingTime: parseInt(parts[2]),
            waitingTime: 0,
            turnaroundTime: 0
        });
    }
    return processes;
}

function calculateMetrics(schedule, processes) {
    let totalWaitingTime = 0, totalTurnaroundTime = 0;
    processes.forEach(p => {
        p.turnaroundTime = schedule.find(s => s.pid === p.pid).end - p.arrivalTime;
        p.waitingTime = p.turnaroundTime - p.burstTime;
        totalWaitingTime += p.waitingTime;
        totalTurnaroundTime += p.turnaroundTime;
    });

    let avgWaitingTime = (totalWaitingTime / processes.length).toFixed(2);
    let avgTurnaroundTime = (totalTurnaroundTime / processes.length).toFixed(2);
    
    document.getElementById("metrics").innerHTML = `
        <b>Average Waiting Time:</b> ${avgWaitingTime} ms <br>
        <b>Average Turnaround Time:</b> ${avgTurnaroundTime} ms
    `;
}

function fcfs(processes) {
    processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
    let time = 0, schedule = [];
    processes.forEach(p => {
        let start = Math.max(time, p.arrivalTime);
        let end = start + p.burstTime;
        schedule.push({ pid: p.pid, start, end });
        time = end;
    });
    return schedule;
}

function sjf(processes) {
    let time = 0, schedule = [], completed = 0;
    while (completed < processes.length) {
        let available = processes.filter(p => p.arrivalTime <= time && p.remainingTime > 0);
        if (available.length === 0) { time++; continue; }
        available.sort((a, b) => a.burstTime - b.burstTime);
        let p = available[0];
        let start = time, end = start + p.burstTime;
        schedule.push({ pid: p.pid, start, end });
        time = end;
        p.remainingTime = 0;
        completed++;
    }
    return schedule;
}

function srtf(processes) {
    let time = 0, schedule = [], completed = 0;
    while (completed < processes.length) {
        let available = processes.filter(p => p.arrivalTime <= time && p.remainingTime > 0);
        if (available.length === 0) { time++; continue; }
        available.sort((a, b) => a.remainingTime - b.remainingTime);
        let p = available[0];
        schedule.push({ pid: p.pid, start: time, end: time + 1 });
        p.remainingTime--;
        time++;
        if (p.remainingTime === 0) completed++;
    }
    return schedule;
}

function roundRobin(processes, quantum) {
    let time = 0, queue = [...processes], schedule = [];
    while (queue.length > 0) {
        let p = queue.shift();
        if (p.remainingTime > quantum) {
            schedule.push({ pid: p.pid, start: time, end: time + quantum });
            p.remainingTime -= quantum;
            time += quantum;
            queue.push(p);
        } else {
            schedule.push({ pid: p.pid, start: time, end: time + p.remainingTime });
            time += p.remainingTime;
            p.remainingTime = 0;
        }
    }
    return schedule;
}

function displayGanttChart(schedule) {
    let chart = document.getElementById("ganttChart");
    chart.innerHTML = "";
    schedule.forEach(s => {
        let div = document.createElement("div");
        div.className = "gantt-block";
        div.textContent = `P${s.pid}`;
        chart.appendChild(div);
    });
}

function calculateSchedule() {
    let processes = parseInput();
    if (processes.length === 0) return;
    let algo = document.getElementById("algorithm").value;
    let schedule = (algo === "fcfs") ? fcfs(processes) :
                   (algo === "sjf") ? sjf(processes) :
                   (algo === "srtf") ? srtf(processes) :
                   roundRobin(processes, parseInt(document.getElementById("timeQuantum").value));
    
    displayGanttChart(schedule);
    calculateMetrics(schedule, processes);
}
