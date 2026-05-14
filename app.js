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

                <h3 style="margin-top: 2rem; margin-bottom: 1rem; font-size: 1.1rem;">Signatures</h3>
                <div class="form-meta">
                    <div class="input-group">
                        <label>Checked by (Image Optional)</label>
                        <input type="file" name="sig_checker" accept="image/*" class="table-input" style="padding: 0.5rem;">
                    </div>
                    <div class="input-group">
                        <label>Manager (Image Optional)</label>
                        <input type="file" name="sig_manager" accept="image/*" class="table-input" style="padding: 0.5rem;">
                    </div>
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

                <h3 style="margin-top: 2rem; margin-bottom: 1rem; font-size: 1.1rem;">Signatures</h3>
                <div class="form-meta">
                    <div class="input-group">
                        <label>Checked by (Image Optional)</label>
                        <input type="file" name="sig_checker" accept="image/*" class="table-input" style="padding: 0.5rem;">
                    </div>
                    <div class="input-group">
                        <label>Manager (Image Optional)</label>
                        <input type="file" name="sig_manager" accept="image/*" class="table-input" style="padding: 0.5rem;">
                    </div>
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
    
    const filePromises = [];
    ['sig_checker', 'sig_manager'].forEach(key => {
        const file = formData.get(key);
        if (file && file.size > 0) {
            const promise = new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    data[key + '_base64'] = event.target.result;
                    resolve();
                };
                reader.readAsDataURL(file);
            });
            filePromises.push(promise);
        }
    });

    Promise.all(filePromises).then(() => {
        const storageData = { ...data };
        delete storageData.sig_checker_base64;
        delete storageData.sig_manager_base64;
        delete storageData.sig_checker;
        delete storageData.sig_manager;

        state.formData = {
            machine: state.currentMachine,
            category: state.currentCategory,
            flow: state.currentFlow,
            data: storageData
        };
        
        localStorage.setItem('lastSubmission', JSON.stringify(state.formData));
        
        if (state.currentFlow === 'non-daily') {
            generateHourlyPDF(data);
        } else {
            generatePDF(data);
        }
    });
}

function generatePDF(data) {
    const pdfDiv = document.createElement('div');
    pdfDiv.className = 'pdf-container';
    pdfDiv.style.width = '210mm';
    pdfDiv.style.padding = '10mm';
    pdfDiv.style.fontFamily = 'Arial, sans-serif';
    pdfDiv.style.color = '#000';

    const parameters = getParametersForCurrentCategory();
    const paramRows = parameters.map((param, index) => `
        <tr>
            <td style="border: 1px solid #000; padding: 5px; text-align: center;">${index + 1}</td>
            <td style="border: 1px solid #000; padding: 5px;">${param}</td>
            <td style="border: 1px solid #000; padding: 5px; text-align: center;">${data['status_'+index] || ''}</td>
            <td style="border: 1px solid #000; padding: 5px;">${data['action_'+index] || ''}</td>
            <td style="border: 1px solid #000; padding: 5px;">${data['remarks_'+index] || ''}</td>
        </tr>
    `).join('');

    pdfDiv.innerHTML = `
        <div style="border: 2px solid #000; padding: 10px;">
            <h1 style="text-align: center; text-transform: uppercase; margin: 0 0 10px 0; font-size: 18px;">${state.currentMachine} - ${state.currentCategory} MAINTENANCE REPORT</h1>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px;">
                <span><strong>DATE:</strong> ${data.date}</span>
                <span><strong>SHIFT:</strong> ${data.shift}</span>
                <span><strong>PRODUCT:</strong> ${data.product}</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
                <thead>
                    <tr style="background: #eee;">
                        <th style="border: 1px solid #000; padding: 5px;">SL</th>
                        <th style="border: 1px solid #000; padding: 5px;">PARAMETERS</th>
                        <th style="border: 1px solid #000; padding: 5px;">STATUS</th>
                        <th style="border: 1px solid #000; padding: 5px;">ACTION</th>
                        <th style="border: 1px solid #000; padding: 5px;">REMARKS</th>
                    </tr>
                </thead>
                <tbody>${paramRows}</tbody>
            </table>
            <div style="margin-top: 30px; display: flex; justify-content: space-between;">
                <div style="text-align: center;">
                    ${data.sig_checker_base64 ? `<img src="${data.sig_checker_base64}" style="height: 40px; display: block;">` : '<div style="height: 40px;"></div>'}
                    <div style="border-top: 1px solid #000; width: 150px; padding-top: 5px; font-size: 10px;">Checked By</div>
                </div>
                <div style="text-align: center;">
                    ${data.sig_manager_base64 ? `<img src="${data.sig_manager_base64}" style="height: 40px; display: block;">` : '<div style="height: 40px;"></div>'}
                    <div style="border-top: 1px solid #000; width: 150px; padding-top: 5px; font-size: 10px;">Manager</div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(pdfDiv);
    html2pdf().set({
        filename: `Maintenance_${state.currentMachine}_${data.date}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(pdfDiv).save().then(() => {
        document.body.removeChild(pdfDiv);
        if (mainContainer) mainContainer.style.display = 'flex';
        state.downloads++;
        updateCounter();
        renderSuccess();
    });
}

function generateHourlyPDF(data) {
    const pdfDiv = document.createElement('div');
    pdfDiv.className = 'pdf-container';
    pdfDiv.style.width = '277mm';
    pdfDiv.style.minHeight = '190mm';
    pdfDiv.style.padding = '8mm';
    pdfDiv.style.fontFamily = 'Arial, Helvetica, sans-serif';
    pdfDiv.style.background = '#fff';
    pdfDiv.style.color = '#000';

    const thStyle = `border:1px solid #000;padding:5px 3px;font-size:8px;font-weight:700;text-align:center;background:#e8e8e8;color:#000;`;
    const tdStyle = `border:1px solid #000;padding:5px 4px;font-size:9px;text-align:center;color:#000;`;
    const defDataStyle = `border:1px solid #000;padding:4px 2px;font-size:8px;text-align:center;color:#000;`;

    const processingRows = ['NOZZLE', '1', '2', '3'].map((zone, idx) => `
        <tr>
            <td style="${tdStyle}font-weight:700;background:#f5f5f5;">${zone}</td>
            <td style="${tdStyle}">${data['proc_temp_'+idx] || ''}</td>
            <td style="${tdStyle}">${data['proc_injspeed_'+idx] || ''}</td>
            <td style="${tdStyle}">${data['proc_injpress_'+idx] || ''}</td>
            <td style="${tdStyle}">${data['proc_holdspeed_'+idx] || ''}</td>
            <td style="${tdStyle}">${data['proc_holdpress_'+idx] || ''}</td>
            <td style="${tdStyle}">${data['proc_injtime_'+idx] || ''}</td>
            <td style="${tdStyle}">${data['proc_holdtime_'+idx] || ''}</td>
            <td style="${tdStyle}">${data['proc_cooltime_'+idx] || ''}</td>
            <td style="${tdStyle}">${data['proc_mouldtemp_'+idx] || ''}</td>
            <td style="${tdStyle}">${data['proc_screwpos_'+idx] || ''}</td>
        </tr>
    `).join('');

    const timeSlots = [
        "08.00 - 09.00", "09.00 - 10.00", "10.00 - 11.00", "11.00 - 12.00", 
        "12.00 - 01.00", "01.00 - 02.00", "02.00 - 03.00", "03.00 - 04.00", 
        "04.00 - 05.00", "05.00 - 06.00", "06.00 - 07.00", "07.00 - 08.00"
    ];

    const defectDataRows = timeSlots.map((time, idx) => `
        <tr>
            <td style="${defDataStyle}font-weight:700;white-space:nowrap;background:#fafafa;">${time}</td>
            <td style="${defDataStyle}">${data['def_setup_'+idx] || ''}</td>
            <td style="${defDataStyle}">${data['def_startup_'+idx] || ''}</td>
            <td style="${defDataStyle}">${data['def_flash_'+idx] || ''}</td>
            <td style="${defDataStyle}">${data['def_weight_'+idx] || ''}</td>
            <td style="${defDataStyle}">${data['def_shot_'+idx] || ''}</td>
            <td style="${defDataStyle}">${data['def_warpage_'+idx] || ''}</td>
            <td style="${defDataStyle}">${data['def_weld_'+idx] || ''}</td>
            <td style="${defDataStyle}">${data['def_flow_'+idx] || ''}</td>
            <td style="${defDataStyle}">${data['def_colour_'+idx] || ''}</td>
            <td style="${defDataStyle}">${data['def_scratches_'+idx] || ''}</td>
            <td style="${defDataStyle}">${data['def_black_'+idx] || ''}</td>
            <td style="${defDataStyle}">${data['def_pin_'+idx] || ''}</td>
            <td style="${defDataStyle}">${data['def_thread_'+idx] || ''}</td>
            <td style="${defDataStyle}">${data['def_fittings_'+idx] || ''}</td>
            <td style="${defDataStyle}font-weight:700;">${data['def_total_'+idx] || ''}</td>
            <td style="${defDataStyle}">${data['def_sign1_'+idx] || ''}</td>
            <td style="${defDataStyle}">${data['def_sign2_'+idx] || ''}</td>
            <td style="${defDataStyle}">${data['def_sign3_'+idx] || ''}</td>
        </tr>
    `).join('');

    const totalRowStyle = `border:2px solid #000;padding:5px 2px;font-size:8px;text-align:center;font-weight:700;color:#000;background:#e8e8e8;`;
    const totalRow = `
        <tr>
            <td style="${totalRowStyle}">TOTAL</td>
            ${Array(18).fill('').map((_, i) => `<td style="${totalRowStyle}">${data['def_grandtotal_'+i] || ''}</td>`).join('')}
        </tr>
    `;

    pdfDiv.innerHTML = `
        <div style="background:#fff;color:#000;">
            <h2 style="text-align:center;text-transform:uppercase;font-size:13px;font-weight:800;margin:0 0 8px 0;color:#000;">
                ${state.currentMachine} &ndash; Hourly Quality Check
            </h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:10px;border:1px solid #000;">
                <tr>
                    <td style="padding:5px 10px;font-size:10px;color:#000;width:34%;border-right:1px solid #000;"><strong>DATE:</strong>&nbsp;${data.date}</td>
                    <td style="padding:5px 10px;font-size:10px;color:#000;width:33%;border-right:1px solid #000;text-align:center;"><strong>SHIFT:</strong>&nbsp;${data.shift}</td>
                    <td style="padding:5px 10px;font-size:10px;color:#000;width:33%;text-align:right;"><strong>PRODUCT:</strong>&nbsp;${data.product}</td>
                </tr>
            </table>
            <p style="font-size:9px;font-weight:700;margin:0 0 3px 0;color:#000;text-transform:uppercase;">PROCESSING PARAMETER (Once in Shift)</p>
            <table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-bottom:10px;">
                <colgroup>
                    <col style="width:9%"><col style="width:9%"><col style="width:9%"><col style="width:9%">
                    <col style="width:9%"><col style="width:9%"><col style="width:9%"><col style="width:9%">
                    <col style="width:9%"><col style="width:10%"><col style="width:9%">
                </colgroup>
                <thead><tr>
                    <th style="${thStyle}">ZONE HEAT</th><th style="${thStyle}">TEMP (°C)</th>
                    <th style="${thStyle}">INJ.SPEED</th><th style="${thStyle}">INJ PRESS</th>
                    <th style="${thStyle}">HOLD SPEED</th><th style="${thStyle}">HOLD PRESS</th>
                    <th style="${thStyle}">INJ TIME</th><th style="${thStyle}">HOLD TIME</th>
                    <th style="${thStyle}">COOL TIME</th><th style="${thStyle}">MOULD TEMP</th>
                    <th style="${thStyle}">SCREW POS</th>
                </tr></thead>
                <tbody>${processingRows}</tbody>
            </table>
            <p style="font-size:9px;font-weight:700;margin:0 0 3px 0;color:#000;text-transform:uppercase;">DEFECT DETAILS (Hourly)</p>
            <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
                <colgroup>
                    <col style="width:8%">
                    <col style="width:4.6%"><col style="width:4.6%"><col style="width:4.6%"><col style="width:4.6%">
                    <col style="width:4.6%"><col style="width:4.6%"><col style="width:4.6%"><col style="width:4.6%">
                    <col style="width:4.6%"><col style="width:4.6%"><col style="width:4.6%"><col style="width:4.6%">
                    <col style="width:4.6%"><col style="width:4.6%"><col style="width:4.6%">
                    <col style="width:5.5%"><col style="width:5.5%"><col style="width:5.5%">
                </colgroup>
                <thead><tr>
                    <th style="${thStyle}">TIME</th>
                    <th style="${thStyle}">SET UP</th><th style="${thStyle}">START UP</th>
                    <th style="${thStyle}">FLASH</th><th style="${thStyle}">WEIGHT</th>
                    <th style="${thStyle}">SHOT</th><th style="${thStyle}">WARPAGE</th>
                    <th style="${thStyle}">WELD LINE</th><th style="${thStyle}">FLOW MARK</th>
                    <th style="${thStyle}">COLOUR</th><th style="${thStyle}">SCRATCH</th>
                    <th style="${thStyle}">BLACK DOTS</th><th style="${thStyle}">PIN MARK</th>
                    <th style="${thStyle}">THREAD</th><th style="${thStyle}">FITTINGS</th>
                    <th style="${thStyle}">TOTAL</th>
                    <th style="${thStyle}">SHIFT IN-CHARGE</th>
                    <th style="${thStyle}">QUALITY SIGN</th>
                    <th style="${thStyle}">PRODN HEAD</th>
                </tr></thead>
                <tbody>${defectDataRows}${totalRow}</tbody>
            </table>
            <table style="width:100%;border-collapse:collapse;margin-top:20px;">
                <tr>
                    <td style="width:50%;text-align:center;border:none;padding:0 30px;vertical-align:bottom;">
                        ${data.sig_checker_base64 ? `<img src="${data.sig_checker_base64}" style="max-height:35px;display:block;margin:0 auto 5px;">` : `<div style="border-bottom:1px solid #000;height:35px;margin-bottom:5px;"></div>`}
                        <p style="font-size:10px;color:#000;margin:0;font-weight:700;">Checked by Signature</p>
                    </td>
                    <td style="width:50%;text-align:center;border:none;padding:0 30px;vertical-align:bottom;">
                        ${data.sig_manager_base64 ? `<img src="${data.sig_manager_base64}" style="max-height:35px;display:block;margin:0 auto 5px;">` : `<div style="border-bottom:1px solid #000;height:35px;margin-bottom:5px;"></div>`}
                        <p style="font-size:10px;color:#000;margin:0;font-weight:700;">Manager Signature</p>
                    </td>
                </tr>
            </table>
        </div>
    `;

    const mainContainer = document.querySelector('.app-container');
    if (mainContainer) mainContainer.style.display = 'none';

    document.body.appendChild(pdfDiv);
    window.scrollTo(0, 0);

    const opt = {
        margin:       5,
        filename:     `HourlyQuality_${state.currentMachine}_${data.date}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(pdfDiv).save().then(() => {
        document.body.removeChild(pdfDiv);
        if (mainContainer) mainContainer.style.display = 'flex';
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
