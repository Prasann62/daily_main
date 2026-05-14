const appContent = document.getElementById('app-content');
const downloadCountEl = document.getElementById('download-count');

// State
let state = {
    downloads: parseInt(localStorage.getItem('pdfDownloads')) || 0,
    currentFlow: null, // 'daily' or 'non-daily'
    currentCategory: null, // 'Injection', 'PRT', 'ISBM'
    currentMachine: null,
    formData: null
};

// Initialize
function init() {
    updateCounter();
    renderHome();
}

function updateCounter() {
    downloadCountEl.textContent = state.downloads;
    localStorage.setItem('pdfDownloads', state.downloads);
}

// Routes/Views
function renderHome() {
    appContent.innerHTML = `
        <div class="view">
            <h2 style="text-align: center; margin-bottom: 2rem; color: var(--text-secondary);">Select Maintenance Type</h2>
            <div class="menu-grid">
                <button class="card-btn" onclick="goToCategory('daily')">
                    <span style="font-size: 2rem;">📅</span>
                    Daily Maintenance
                </button>
                <button class="card-btn" onclick="goToCategory('non-daily')">
                    <span style="font-size: 2rem;">⏳</span>
                    Hourly Quality Check
                </button>
                <button class="card-btn" onclick="renderEditPdf()">
                    <span style="font-size: 2rem;">📝</span>
                    Edit Recent PDF
                </button>
            </div>
        </div>
    `;
}

function goToCategory(flow) {
    state.currentFlow = flow;
    appContent.innerHTML = `
        <div class="view">
            <div class="form-header">
                <h2>${flow === 'daily' ? 'Daily Maintenance' : 'Hourly Quality Check'} > Select Category</h2>
                <button class="btn btn-secondary" onclick="renderHome()">Back to Home</button>
            </div>
            <div class="menu-grid">
                <button class="card-btn" onclick="goToMachine('Injection')">Injection</button>
                <button class="card-btn" onclick="goToMachine('PRT')">PRT</button>
                <button class="card-btn" onclick="handleMachineSelect('ISBM', 'ISBM Machine')">ISBM</button>
            </div>
        </div>
    `;
}

function goToMachine(category) {
    state.currentCategory = category;
    
    let machines = [];
    if (category === 'Injection') machines = ['Yizumi', 'Arburg'];
    else if (category === 'PRT') machines = ['Sai Samarth', 'Bahubali'];

    appContent.innerHTML = `
        <div class="view">
            <div class="form-header">
                <h2>${category} > Select Machine</h2>
                <button class="btn btn-secondary" onclick="goToCategory(state.currentFlow)">Back</button>
            </div>
            <div class="menu-grid">
                ${machines.map(m => `<button class="card-btn" onclick="handleMachineSelect('${category}', '${m}')">${m}</button>`).join('')}
            </div>
        </div>
    `;
}

function handleMachineSelect(category, machine) {
    if (state.currentFlow === 'non-daily') {
        goToHourlyForm(category, machine);
    } else {
        goToForm(category, machine);
    }
}

// Machine Specific Parameters for Daily Maintenance
const formParameters = {
    'Injection': [
        "Check program values with master print",
        "Check cycle time in SPC",
        "Check material grade/color",
        "Check oil level",
        "Check water cooling for mold & machine",
        "Check machine for oil leakage",
        "Check all heaters using meter",
        "Check for nozzle leak",
        "Check tie-bars/pattern plate for grease",
        "Check mould/stripper/ejector plate bolts",
        "Check mould cooling leak & hose",
        "Check mould close/open and ejection smooth without noise",
        "Check hopper bolts tight, hopper doesn't shake",
        "Overall machine clean"
    ],
    'PRT': [
        "Check program values with master print",
        "Check cycle time in SPC",
        "Check preform weight, company, standard",
        "Check locking cylinder oil level",
        "Check water cooling for mold & machine",
        "Check all heaters wire check",
        "Check all heaters using meter",
        "Check pressure level low & high",
        "Check tie-bars/pattern plate for grease",
        "Check ejector plate bolts",
        "Check mould cooling leak & hose",
        "Check bottom stretch rods bolts & measurements",
        "Check for air leak from locking cylinder",
        "Check mould top/bottom insert screws",
        "Check BTM rod bolts",
        "Overall machine clean"
    ],
    'ISBM': [
        "Bottom Board Allen Bolt",
        "Blow Mould Check",
        "Closing Lock Plate Bolts",
        "Lip Mould Pin Check",
        "Blow Core Bolt",
        "Ejector Allen Bolt",
        "HRB Mould Allen Bolt",
        "INJ Core Allen Bolt",
        "Chiller Flow Check",
        "LIP Mould Bolt Check",
        "Hot Pot Allen Bolt",
        "Barrel Heater",
        "Injection - Pre",
        "Clamp - Pressure",
        "Tiebar Grease Check",
        "Heater Check using Meter",
        "Overall Machine Clean",
        "Oil Level Check",
        "Oven Temp Check - 163"
    ]
};

function getParametersForCurrentCategory() {
    return formParameters[state.currentCategory] || formParameters['Injection'];
}

function goToForm(category, machine) {
    state.currentCategory = category;
    state.currentMachine = machine;
    const parameters = getParametersForCurrentCategory();

    const paramRows = parameters.map((param, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${param}</td>
            <td>
                <div class="status-radios">
                    <label><input type="radio" name="status_${index}" value="OK" required> OK</label>
                    <label><input type="radio" name="status_${index}" value="NOT OK"> NOT OK</label>
                </div>
            </td>
            <td><input type="text" class="table-input" name="action_${index}"></td>
            <td><input type="text" class="table-input" name="remarks_${index}"></td>
        </tr>
    `).join('');

    appContent.innerHTML = `
        <div class="view glass-panel">
            <div class="form-header">
                <h2>Daily Maintenance Form: ${machine} (${category})</h2>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-secondary" onclick="goToMachine('${category}')">Back</button>
                    <button class="btn btn-secondary" onclick="renderHome()">Cancel</button>
                </div>
            </div>
            
            <form id="maintenance-form" onsubmit="handleFormSubmit(event)">
                <div class="form-meta">
                    <div class="input-group">
                        <label>Date</label>
                        <input type="date" name="date" required>
                    </div>
                    <div class="input-group">
                        <label>Shift</label>
                        <select name="shift" required>
                            <option value="Day">Day</option>
                            <option value="Night">Night</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Name of the Product</label>
                        <input type="text" name="product" required>
                    </div>
                </div>

                <div style="overflow-x: auto;">
                    <table class="maintenance-table">
                        <thead>
                            <tr>
                                <th>SL.NO</th>
                                <th>PARAMETERS</th>
                                <th style="width: 150px;">STATUS</th>
                                <th>TAKEN ACTION</th>
                                <th>REMARKS</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${paramRows}
                        </tbody>
                    </table>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Submit & Generate PDF</button>
                </div>
            </form>
        </div>
    `;
}

function goToHourlyForm(category, machine) {
    state.currentCategory = category;
    state.currentMachine = machine;

    const processingRows = ['NOZZLE', '1', '2', '3'].map((zone, idx) => `
        <tr>
            <td><strong>${zone}</strong></td>
            <td><input type="text" class="table-input" name="proc_temp_${idx}"></td>
            <td><input type="text" class="table-input" name="proc_injspeed_${idx}"></td>
            <td><input type="text" class="table-input" name="proc_injpress_${idx}"></td>
            <td><input type="text" class="table-input" name="proc_holdspeed_${idx}"></td>
            <td><input type="text" class="table-input" name="proc_holdpress_${idx}"></td>
            <td><input type="text" class="table-input" name="proc_injtime_${idx}"></td>
            <td><input type="text" class="table-input" name="proc_holdtime_${idx}"></td>
            <td><input type="text" class="table-input" name="proc_cooltime_${idx}"></td>
            <td><input type="text" class="table-input" name="proc_mouldtemp_${idx}"></td>
            <td><input type="text" class="table-input" name="proc_screwpos_${idx}"></td>
        </tr>
    `).join('');

    const timeSlots = [
        "08.00 - 09.00", "09.00 - 10.00", "10.00 - 11.00", "11.00 - 12.00", 
        "12.00 - 01.00", "01.00 - 02.00", "02.00 - 03.00", "03.00 - 04.00", 
        "04.00 - 05.00", "05.00 - 06.00", "06.00 - 07.00", "07.00 - 08.00"
    ];

    const defectRows = timeSlots.map((time, idx) => `
        <tr>
            <td style="white-space: nowrap;"><strong>${time}</strong></td>
            <td><input type="text" class="table-input" name="def_setup_${idx}"></td>
            <td><input type="text" class="table-input" name="def_startup_${idx}"></td>
            <td><input type="text" class="table-input" name="def_flash_${idx}"></td>
            <td><input type="text" class="table-input" name="def_weight_${idx}"></td>
            <td><input type="text" class="table-input" name="def_shot_${idx}"></td>
            <td><input type="text" class="table-input" name="def_warpage_${idx}"></td>
            <td><input type="text" class="table-input" name="def_weld_${idx}"></td>
            <td><input type="text" class="table-input" name="def_flow_${idx}"></td>
            <td><input type="text" class="table-input" name="def_colour_${idx}"></td>
            <td><input type="text" class="table-input" name="def_scratches_${idx}"></td>
            <td><input type="text" class="table-input" name="def_black_${idx}"></td>
            <td><input type="text" class="table-input" name="def_pin_${idx}"></td>
            <td><input type="text" class="table-input" name="def_thread_${idx}"></td>
            <td><input type="text" class="table-input" name="def_fittings_${idx}"></td>
            <td><input type="text" class="table-input" name="def_total_${idx}"></td>
            <td><input type="text" class="table-input" name="def_sign1_${idx}"></td>
            <td><input type="text" class="table-input" name="def_sign2_${idx}"></td>
            <td><input type="text" class="table-input" name="def_sign3_${idx}"></td>
        </tr>
    `).join('') + `
        <tr>
            <td><strong>TOTAL</strong></td>
            ${Array(18).fill('').map((_, i) => `<td><input type="text" class="table-input" name="def_grandtotal_${i}"></td>`).join('')}
        </tr>
    `;

    appContent.innerHTML = `
        <div class="view glass-panel">
            <div class="form-header">
                <h2>Hourly Quality Form: ${machine} (${category})</h2>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-secondary" onclick="goToMachine('${category}')">Back</button>
                    <button class="btn btn-secondary" onclick="renderHome()">Cancel</button>
                </div>
            </div>
            
            <form id="hourly-form" onsubmit="handleFormSubmit(event)">
                <div class="form-meta">
                    <div class="input-group">
                        <label>Date</label>
                        <input type="date" name="date" required>
                    </div>
                    <div class="input-group">
                        <label>Shift</label>
                        <select name="shift" required>
                            <option value="Day">Day</option>
                            <option value="Night">Night</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Name of the Product</label>
                        <input type="text" name="product" required>
                    </div>
                </div>

                <h3 style="margin-top: 2rem; margin-bottom: 1rem; font-size: 1.1rem;">PROCESSING PARAMETER (Once in Shift)</h3>
                <div style="overflow-x: auto;">
                    <table class="maintenance-table" style="min-width: 1000px; font-size: 0.85rem;">
                        <thead>
                            <tr>
                                <th>ZONE HEAT</th>
                                <th>TEMP (°C)</th>
                                <th>INJ.SPEED (m/s)</th>
                                <th>INJ PRESS (KG/CM²)</th>
                                <th>HOLD. SPEED (m/s)</th>
                                <th>HOLD.PRESS. (Kg/Cm²)</th>
                                <th>INJ TIME (Sec)</th>
                                <th>HOLD TIME (Sec)</th>
                                <th>COOL TIME (Sec)</th>
                                <th>MOULD TEMP (°C)</th>
                                <th>SCREW POS (MM)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${processingRows}
                        </tbody>
                    </table>
                </div>

                <h3 style="margin-top: 2rem; margin-bottom: 1rem; font-size: 1.1rem;">DEFECT DETAILS</h3>
                <div style="overflow-x: auto;">
                    <table class="maintenance-table" style="min-width: 1500px; font-size: 0.8rem;">
                        <thead>
                            <tr>
                                <th>TIME</th>
                                <th>SET UP REJ</th>
                                <th>START UP REJ</th>
                                <th>FLASH</th>
                                <th>WEIGHT</th>
                                <th>SHOT MOULD</th>
                                <th>WARPAGE</th>
                                <th>WELD LINE</th>
                                <th>FLOW MARK</th>
                                <th>COLOUR</th>
                                <th>SCRATCHES</th>
                                <th>BLACK DOTS</th>
                                <th>PIN MARK</th>
                                <th>THREAD LINES</th>
                                <th>FITTINGS</th>
                                <th>TOTAL</th>
                                <th>SHIFT IN-CHARGE</th>
                                <th>QUALITY SIGN</th>
                                <th>PRODN HEAD</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${defectRows}
                        </tbody>
                    </table>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Submit & Generate PDF</button>
                </div>
            </form>
        </div>
    `;
}


function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Save to state for editing later
    state.formData = {
        machine: state.currentMachine,
        category: state.currentCategory,
        flow: state.currentFlow,
        data: data
    };
    
    localStorage.setItem('lastSubmission', JSON.stringify(state.formData));
    
    if (state.currentFlow === 'non-daily') {
        generateHourlyPDF(data);
    } else {
        generatePDF(data);
    }
}

function generatePDF(data) {
    // Create a temporary hidden div for the PDF content
    const pdfDiv = document.createElement('div');
    pdfDiv.className = 'pdf-container';
    const parameters = getParametersForCurrentCategory();
    
    const paramRows = parameters.map((param, index) => `
        <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td>${param}</td>
            <td style="text-align: center;">${data['status_'+index] || ''}</td>
            <td>${data['action_'+index] || ''}</td>
            <td>${data['remarks_'+index] || ''}</td>
        </tr>
    `).join('');

    pdfDiv.innerHTML = `
        <h2 style="text-transform: uppercase;">${state.currentMachine} - ${state.currentCategory} DAILY MAINTENANCE</h2>
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <p><strong>DATE:</strong> ${data.date}</p>
            <p><strong>SHIFT:</strong> ${data.shift}</p>
        </div>
        <p style="margin-bottom: 20px;"><strong>PRODUCT:</strong> ${data.product}</p>
        
        <table>
            <thead>
                <tr style="background: #f0f0f0;">
                    <th>SL.NO</th>
                    <th>PARAMETERS</th>
                    <th>STATUS</th>
                    <th>TAKEN ACTION</th>
                    <th>REMARKS</th>
                </tr>
            </thead>
            <tbody>
                ${paramRows}
            </tbody>
        </table>

        <div class="signatures">
            <div class="sig-box">
                <div class="sig-line"></div>
                <p>Checked by Signature</p>
            </div>
            <div class="sig-box">
                <div class="sig-line"></div>
                <p>Manager Signature</p>
            </div>
        </div>
    `;

    document.body.appendChild(pdfDiv);

    const opt = {
        margin:       10,
        filename:     `Maintenance_${state.currentMachine}_${data.date}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(pdfDiv).save().then(() => {
        document.body.removeChild(pdfDiv);
        state.downloads++;
        updateCounter();
        renderSuccess();
    });
}

function generateHourlyPDF(data) {
    const pdfDiv = document.createElement('div');
    pdfDiv.className = 'pdf-container';
    // Use landscape for hourly because it is very wide
    pdfDiv.style.width = '297mm';
    pdfDiv.style.minHeight = '210mm';

    const processingRows = ['NOZZLE', '1', '2', '3'].map((zone, idx) => `
        <tr>
            <td><strong>${zone}</strong></td>
            <td>${data['proc_temp_'+idx] || ''}</td>
            <td>${data['proc_injspeed_'+idx] || ''}</td>
            <td>${data['proc_injpress_'+idx] || ''}</td>
            <td>${data['proc_holdspeed_'+idx] || ''}</td>
            <td>${data['proc_holdpress_'+idx] || ''}</td>
            <td>${data['proc_injtime_'+idx] || ''}</td>
            <td>${data['proc_holdtime_'+idx] || ''}</td>
            <td>${data['proc_cooltime_'+idx] || ''}</td>
            <td>${data['proc_mouldtemp_'+idx] || ''}</td>
            <td>${data['proc_screwpos_'+idx] || ''}</td>
        </tr>
    `).join('');

    const timeSlots = [
        "08.00 - 09.00", "09.00 - 10.00", "10.00 - 11.00", "11.00 - 12.00", 
        "12.00 - 01.00", "01.00 - 02.00", "02.00 - 03.00", "03.00 - 04.00", 
        "04.00 - 05.00", "05.00 - 06.00", "06.00 - 07.00", "07.00 - 08.00"
    ];

    const defectRows = timeSlots.map((time, idx) => `
        <tr>
            <td style="white-space: nowrap; font-size: 8px;"><strong>${time}</strong></td>
            <td>${data['def_setup_'+idx] || ''}</td>
            <td>${data['def_startup_'+idx] || ''}</td>
            <td>${data['def_flash_'+idx] || ''}</td>
            <td>${data['def_weight_'+idx] || ''}</td>
            <td>${data['def_shot_'+idx] || ''}</td>
            <td>${data['def_warpage_'+idx] || ''}</td>
            <td>${data['def_weld_'+idx] || ''}</td>
            <td>${data['def_flow_'+idx] || ''}</td>
            <td>${data['def_colour_'+idx] || ''}</td>
            <td>${data['def_scratches_'+idx] || ''}</td>
            <td>${data['def_black_'+idx] || ''}</td>
            <td>${data['def_pin_'+idx] || ''}</td>
            <td>${data['def_thread_'+idx] || ''}</td>
            <td>${data['def_fittings_'+idx] || ''}</td>
            <td>${data['def_total_'+idx] || ''}</td>
            <td>${data['def_sign1_'+idx] || ''}</td>
            <td>${data['def_sign2_'+idx] || ''}</td>
            <td>${data['def_sign3_'+idx] || ''}</td>
        </tr>
    `).join('') + `
        <tr>
            <td style="font-size: 8px;"><strong>TOTAL</strong></td>
            ${Array(18).fill('').map((_, i) => `<td>${data['def_grandtotal_'+i] || ''}</td>`).join('')}
        </tr>
    `;

    pdfDiv.innerHTML = `
        <h2 style="text-transform: uppercase;">${state.currentMachine} - HOURLY QUALITY CHECK</h2>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <p><strong>DATE:</strong> ${data.date}</p>
            <p><strong>SHIFT:</strong> ${data.shift}</p>
            <p><strong>PRODUCT:</strong> ${data.product}</p>
        </div>
        
        <h3 style="font-size: 12px; margin-bottom: 5px;">PROCESSING PARAMETER</h3>
        <table style="font-size: 9px;">
            <thead>
                <tr style="background: #f0f0f0;">
                    <th>ZONE HEAT</th><th>TEMP</th><th>INJ.SPEED</th><th>INJ PRESS</th>
                    <th>HOLD. SPEED</th><th>HOLD.PRESS</th><th>INJ TIME</th>
                    <th>HOLD TIME</th><th>COOL TIME</th><th>MOULD TEMP</th><th>SCREW POS</th>
                </tr>
            </thead>
            <tbody>${processingRows}</tbody>
        </table>

        <h3 style="font-size: 12px; margin-bottom: 5px; margin-top: 15px;">DEFECT DETAILS</h3>
        <table style="font-size: 8px;">
            <thead>
                <tr style="background: #f0f0f0;">
                    <th>TIME</th><th>SET UP</th><th>START UP</th><th>FLASH</th><th>WEIGHT</th>
                    <th>SHOT MOULD</th><th>WARPAGE</th><th>WELD LINE</th><th>FLOW MARK</th>
                    <th>COLOUR</th><th>SCRATCHES</th><th>BLACK DOTS</th><th>PIN MARK</th>
                    <th>THREAD LINES</th><th>FITTINGS</th><th>TOTAL</th>
                    <th>SHIFT IN-CHARGE</th><th>QUALITY SIGN</th><th>PRODN HEAD</th>
                </tr>
            </thead>
            <tbody>${defectRows}</tbody>
        </table>
    `;

    document.body.appendChild(pdfDiv);

    const opt = {
        margin:       5,
        filename:     `HourlyQuality_${state.currentMachine}_${data.date}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(pdfDiv).save().then(() => {
        document.body.removeChild(pdfDiv);
        state.downloads++;
        updateCounter();
        renderSuccess();
    });
}

function renderSuccess() {
    appContent.innerHTML = `
        <div class="view glass-panel" style="text-align: center; padding: 4rem 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
            <h2 style="color: var(--success); margin-bottom: 1rem;">PDF Downloaded Successfully!</h2>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">The form has been converted and saved to your device.</p>
            
            <div style="display: flex; justify-content: center; gap: 1rem;">
                <button class="btn btn-secondary" onclick="shareData()">Share Form</button>
                <button class="btn btn-primary" onclick="renderHome()">Back to Menu</button>
            </div>
        </div>
    `;
}

function shareData() {
    if (navigator.share) {
        navigator.share({
            title: 'Maintenance Form',
            text: 'Here is the latest maintenance form record.',
            url: window.location.href
        }).catch(console.error);
    } else {
        alert('Web Share API is not supported in your browser.');
    }
}

function renderEditPdf() {
    const lastSub = JSON.parse(localStorage.getItem('lastSubmission'));
    
    if (!lastSub) {
        appContent.innerHTML = `
            <div class="view glass-panel" style="text-align: center; padding: 4rem;">
                <h2>No Recent Forms Found</h2>
                <p style="color: var(--text-secondary); margin: 1rem 0;">You need to submit a form first before you can edit it.</p>
                <button class="btn btn-primary" onclick="renderHome()">Back to Home</button>
            </div>
        `;
        return;
    }

    state.currentMachine = lastSub.machine;
    state.currentCategory = lastSub.category;
    state.currentFlow = lastSub.flow;
    
    if (state.currentFlow === 'non-daily') {
        goToHourlyForm(lastSub.category, lastSub.machine);
    } else {
        goToForm(lastSub.category, lastSub.machine);
    }
    
    setTimeout(() => {
        const form = document.getElementById(state.currentFlow === 'non-daily' ? 'hourly-form' : 'maintenance-form');
        for (const key in lastSub.data) {
            const input = form.elements[key];
            if (input) {
                if (input.type === 'radio') {
                    const radio = form.querySelector(`input[name="${key}"][value="${lastSub.data[key]}"]`);
                    if (radio) radio.checked = true;
                } else {
                    input.value = lastSub.data[key];
                }
            }
        }
    }, 100);
}

// Start
init();
