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
    initDarkMode();
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
            <div class="section-title" style="margin-top: 1rem;">
                <h2>What would you like to do?</h2>
                <p>Select a maintenance type to begin filling out your form</p>
            </div>
            <div class="menu-grid">
                <button class="card-btn" onclick="goToCategory('daily')">
                    <span>🛠️</span>
                    Daily Maintenance
                </button>
                <button class="card-btn" onclick="goToCategory('non-daily')">
                    <span>📊</span>
                    Hourly Quality Check
                </button>
                <button class="card-btn" onclick="renderEditPdf()">
                    <span>✏️</span>
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
                <button class="card-btn" onclick="goToMachine('Compressor')"><span>🏭</span>Compressor</button>
            </div>
        </div>
    `;
}

function goToMachine(category) {
    state.currentCategory = category;
    
    let machines = [];
    if (category === 'Injection') machines = ['Yizumi', 'Arburg'];
    else if (category === 'PRT') machines = ['Sai Samarth', 'Bahubali'];
    else if (category === 'Compressor') machines = ['High Pressure Compressor', 'Low Pressure Compressor'];

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
        "ப்ரோக்ராமில் உள்ள அளவுகள் மாஸ்டர் பிரிண்ட்டுடன் செக் செய்வது (Check program values with master print)",
        "SPC இல் சைக்கிள் டைம் செக் செய்வது (Check cycle time in SPC)",
        "மெட்டீரியல் கிரேடு/கலர் செக் செய்வது (Check material grade/color)",
        "ஆயில் லெவல் செக் செய்வது (Check oil level)",
        "வாட்டர் கூலிங் ...மோல்ட் & மெஷின் (Check water cooling for mold & machine)",
        "மெஷினில் Oil லீகேஜ் செக் செய்வது (Check machine for oil leakage)",
        "All ஹீட்டர்ஸ்-மீட்டர் மூலம் செக் செய்வது (Check all heaters using meter)",
        "Nozzle-நாசில் லீக் இருக்கிறதா? (Check for nozzle leak)",
        "Tie bars-Pattern பிலேட்டர்ன்/டை-பார்ஸ், கிரீஸ் வைக்கப்பட்டுள்ளதா? (Check tie-bars/pattern plate for grease)",
        "MOULD-ஸ்ட்டிரிப்பர்-எஜெக்டர் பிளேட்டில் போல்ட்டுகளில் லூஸ் உள்ளதா? (Check mould/stripper/ejector plate bolts)",
        "மோல்ட் கூலிங் லீக் & ஹோஸ் சரியாக உள்ளதா? (Check mould cooling leak & hose)",
        "மோல்ட் திற/மூடும் போது சைக்கிள் மற்றும் ஏஜெக்சன் சத்தம் இல்லாமல் நடக்கிறதா? (Check mould open/close and ejection smooth without noise)",
        "ஹாப்பர் போல்ட்டுகள் இறுக்கமாக உள்ளதா, ஹாப்பர் ஆடவில்லையா? (Check hopper bolts tight, hopper doesn't shake)",
        "ஒட்டுமொத்த மெஷின் சுத்தமாக உள்ளதா? (Overall machine clean)"
    ],
    'PRT': [
        "ப்ரோக்ராமில் உள்ள அளவுகள் மாஸ்டர் பிரிண்ட்டுடன் செக் செய்வது (Check program values with master print)",
        "சைக்கிள் டைம் SPC இல் செக் செய்வது (Check cycle time in SPC)",
        "ப்ரீபார்ம் எடை, கம்பெனி, ஸ்டேண்டர்டுடன் செக் செய்வது (Check preform weight, company, standard)",
        "லாக்கிங் சிலிண்டர்-ஆயில் லெவல் செக் செய்வது (Check locking cylinder oil level)",
        "வாட்டர் கூலிங் ...மோல்ட் & மெஷின் (Check water cooling for mold & machine)",
        "All ஹீட்டர்ஸ்-வையர் சரியாக உள்ளதா? ப்ரீபார்ம் உரசிய தடம் பல்பில் உள்ளதா என செக் செய்வது (Check all heaters wire, preform contact marks)",
        "All ஹீட்டர்ஸ்-மீட்டர் மூலம் செக் செய்வது (Check all heaters using meter)",
        "பிரஷர் லெவல் LOW & HIGH செக் செய்வது (Check pressure level low & high)",
        "Tie bars-Pattern பிலேட்டர்ன்/டை-பார்ஸ், கிரீஸ் வைக்கப்பட்டுள்ளதா? (Check tie-bars/pattern plate for grease)",
        "எஜெக்டர் பிளேட்டில் போல்ட்டுகளில் லூஸ் உள்ளதா? (Check ejector plate bolts)",
        "மோல்ட் கூலிங் லீக் & ஹோஸ் சரியாக உள்ளதா? (Check mould cooling leak & hose)",
        "BOOTOM STRETCH RODS - அணைத்து போல்ட்டுகளும் டைட் மற்றும் அளவுகள் சரியாக உள்ளதா? (Check bottom stretch rods bolts & measurements)",
        "லாக்கிங் சிலிண்டரில் இருந்து பிளோவ் செய்யும் போது ஏர் லீக் ஆகுதா (Check for air leak from locking cylinder)",
        "MOULD - டாப் பாட்டம் இன்செர்ட் -ஸ்குரூ டைட்டாக உள்ளாதா (Check mould top/bottom insert screws)",
        "BTM- ராடு போல்ட்டுகள் டைட்டாக உள்ளாதா (Check BTM rod bolts)",
        "OVER ALL- மெஷின் (CLEAN) சுத்தமாக உள்ளதா? (Overall machine clean)"
    ],
    'ISBM': [
        "பாட்டம் போரடு - அலன் போல்டு (Bottom Board Allen Bolt)",
        "Blow Mould - சரியாக உன்னதா? (Blow Mould Check)",
        "Closing Lock Plate - 2 பக்கம் போல்டு (Closing Lock Plate Bolts)",
        "LIP Mould Pin - கட்டாக உன்னதா? (Lip Mould Pin Check)",
        "BLOW Core - அலன் போல்டு (Blow Core Bolt)",
        "Ejector - அலன் போல்டு (Ejector Allen Bolt)",
        "HRB Mould - அலன் போல்டு (HRB Mould Allen Bolt)",
        "INJ Core - அலன் போல்டு (INJ Core Allen Bolt)",
        "Cooling - Chiller சரியாக செல்கிறதா? (Chiller Flow Check)",
        "LIP Mould - அலன் போல்டு Check (LIP Mould Bolt Check)",
        "Hot Pot - அலன் போல்டு (Hot Pot Allen Bolt)",
        "Barrel Heater (பேரல் ஹீட்டர்)",
        "Inj - Pre (இன்ஜெக்சன் - ப்ரி)",
        "Clamp - Pressure (கிளாம்ப் - பிரஷர்)",
        "Tiebar Grease Check (டையர் கிரீஸ் செக்)",
        "Heater Check using Meter (ஹீட்டர் முலம் செக்)",
        "All-over Machine Clean (மிஷின் முழுவதையும் கத்தம் செய்தல்)",
        "Oil Level Check (ஆயில் வெல் செக்)",
        "Oven Temp Check - 163 (ஓவன் வெப்பதிலை செக் - 163)"
    ],
    'Compressor': [
        "Oil / Lube Level in Running Condition (இயங்கும் நிலையில் ஆயில் அளவு சரிபார்ப்பு)",
        "Drain Reciprocator Tank Condensate (கம்ப்ரஸர் டேங்கில் உள்ள தண்ணீரை வெளியேற்றுதல்)",
        "Check Unusual Noise & Vibration (வழக்கத்திற்கு மாறான சத்தம் மற்றும் அதிர்வு உள்ளதா?)",
        "Check Input Power Supply Voltage / Phase / Current (மின்சார வோல்டேஜ், பேஸ் மற்றும் கரண்ட் சரிபார்த்தல்)",
        "Check For Oil Leakage (ஆயில் கசிவு ஏதேனும் உள்ளதா என சரிபார்த்தல்)",
        "Electrical Connection Stability (மின் இணைப்புகள் சரியாக உள்ளதா என சரிபார்த்தல்)",
        "Tightness of Fasteners & Bolts (போல்ட்டுகள் மற்றும் நட்டுகள் சரியாக இறுக்கமாக உள்ளதா?)",
        "Inspect Drive Belt, Adjust If Necessary (டைரவ் பெல்ட்டின் நிலை மற்றும் மேம்போக்கு சரிபார்த்தல்)",
        "OVER ALL - MACHINE CLEAN (மெஷின் ஒட்டுமொத்தமாக சுத்தமாக உள்ளதா?)"
    ],
    'Chiller': [
        "Chiller Water Level Check (சில்லர் தண்ணீர் மட்டம் சரிபார்ப்பு)",
        "Chiller Set Temperature Check (சில்லர் வெப்பநிலை அமைப்பு சரிபார்ப்பு)",
        "Coolant Flow Rate Check (குளிர்பான ஓட்டம் சரிபார்ப்பு)",
        "Refrigerant Pressure Check (குளிர்பான அழுத்தம் சரிபார்ப்பு)",
        "Condenser / Filter Clean (கண்டென்சர் / வடிகட்டி சுத்தம்)",
        "Chiller Pump Operation Check (சில்லர் பம்ப் இயக்கம் சரிபார்ப்பு)"
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

    // Chiller section — only for High Pressure Compressor
    const isHighPressure = machine === 'High Pressure Compressor';
    const chillerParams = formParameters['Chiller'] || [];
    const chillerRows = chillerParams.map((param, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${param}</td>
            <td>
                <div class="status-radios">
                    <label><input type="radio" name="chiller_status_${idx}" value="OK" required> OK</label>
                    <label><input type="radio" name="chiller_status_${idx}" value="NOT OK"> NOT OK</label>
                </div>
            </td>
            <td><input type="text" class="table-input" name="chiller_action_${idx}"></td>
            <td><input type="text" class="table-input" name="chiller_remarks_${idx}"></td>
        </tr>
    `).join('');
    const chillerSection = isHighPressure ? `
        <h3 style="margin-top: 2rem; margin-bottom: 1rem; font-size: 1.1rem;">🧊 Chiller Check</h3>
        <div style="overflow-x: auto;">
            <table class="maintenance-table">
                <thead>
                    <tr>
                        <th>SL.NO</th>
                        <th>CHILLER PARAMETERS / சில்லர் அளவுகோல்</th>
                        <th style="width: 150px;">STATUS</th>
                        <th>TAKEN ACTION</th>
                        <th>REMARKS</th>
                    </tr>
                </thead>
                <tbody>${chillerRows}</tbody>
            </table>
        </div>
    ` : '';

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
                    <div class="input-group">
                        <label>Operator Name</label>
                        <input type="text" name="operator" placeholder="Enter operator name" required>
                    </div>
                </div>

                <div style="display:flex; justify-content:flex-end; margin-bottom:0.75rem;">
                    <button type="button" class="btn" style="background:#2563eb;color:#fff;font-size:0.8rem;padding:0.5rem 1.1rem;" onclick="quickOkAll(event)">
                        ✅ Mark All OK
                    </button>
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

                ${chillerSection}

                <h3 style="margin-top: 2rem; margin-bottom: 1rem; font-size: 1.1rem;">Signatures</h3>
                <div class="form-meta" style="background: #fff8f0; border: 1.5px solid #f59e0b; border-radius: 10px; padding: 1.25rem;">
                    <div class="input-group">
                        <label style="color: #b45309; font-weight: 700;">✍️ Checked by Signature <span style="color: #dc2626;">*</span></label>
                        <input type="file" name="sig_checker" accept="image/*" class="table-input" style="padding: 0.5rem;" required>
                    </div>
                    <div class="input-group">
                        <label style="color: #b45309; font-weight: 700;">🖊️ Manager Signature <span style="color: #dc2626;">*</span></label>
                        <input type="file" name="sig_manager" accept="image/*" class="table-input" style="padding: 0.5rem;" required>
                    </div>
                </div>
                <p id="sig-error" style="display:none; color:#dc2626; font-size:0.85rem; font-weight:600; margin-top:0.75rem; padding:0.75rem 1rem; background:#fee2e2; border:1.5px solid #fca5a5; border-radius:8px;">⚠️ Both signatures are required before generating the PDF.</p>

                <div style="display:flex;justify-content:flex-end;align-items:center;gap:0.75rem;margin-top:1.5rem;padding-top:1.25rem;border-top:1px solid var(--border);">
                    <button type="button" class="btn btn-secondary" onclick="renderHome()">Cancel</button>
                    <button type="submit" class="btn" style="background:#16a34a;color:#fff;font-weight:700;box-shadow:0 2px 8px rgba(22,163,74,0.3);">
                        📄 Generate PDF
                    </button>
                </div>
            </form>
        </div>
    `;
    // Auto-fill date & detect shift by current time
    const _df = document.querySelector('#maintenance-form [name="date"]');
    if (_df && !_df.value) _df.value = new Date().toISOString().split('T')[0];
    const _sf = document.querySelector('#maintenance-form [name="shift"]');
    if (_sf) { const h = new Date().getHours(); _sf.value = (h >= 8 && h < 20) ? 'Day' : 'Night'; }
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
                <div class="form-meta" style="background:#eff6ff; border:1.5px solid #2563eb; border-radius:10px; padding:1.25rem;">
                    <div style="grid-column:1/-1; font-size:0.78rem; color:#1d4ed8; font-weight:700; margin-bottom:0.5rem;">
                        💡 Date, Shift & Product are auto-saved — fill once, reused for all machine forms!
                    </div>
                    <div class="input-group">
                        <label>தேதி (Date)</label>
                        <input type="date" name="date" id="hourly-date" required>
                    </div>
                    <div class="input-group">
                        <label>ஷிப்ட் (Shift)</label>
                        <select name="shift" id="hourly-shift" required>
                            <option value="Day">Day</option>
                            <option value="Night">Night</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>தயாரிப்பு (Product)</label>
                        <input type="text" name="product" id="hourly-product" required>
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
                <div class="form-meta" style="background: #fff8f0; border: 1.5px solid #f59e0b; border-radius: 10px; padding: 1.25rem;">
                    <div class="input-group">
                        <label style="color: #b45309; font-weight: 700;">✍️ Checked by Signature <span style="color: #dc2626;">*</span></label>
                        <input type="file" name="sig_checker" accept="image/*" class="table-input" style="padding: 0.5rem;" required>
                    </div>
                    <div class="input-group">
                        <label style="color: #b45309; font-weight: 700;">🖊️ Manager Signature <span style="color: #dc2626;">*</span></label>
                        <input type="file" name="sig_manager" accept="image/*" class="table-input" style="padding: 0.5rem;" required>
                    </div>
                </div>
                <p id="sig-error" style="display:none; color:#dc2626; font-size:0.85rem; font-weight:600; margin-top:0.75rem; padding:0.75rem 1rem; background:#fee2e2; border:1.5px solid #fca5a5; border-radius:8px;">⚠️ Both signatures are required before generating the PDF.</p>

                <div style="display:flex;justify-content:flex-end;align-items:center;gap:0.75rem;margin-top:1.5rem;padding-top:1.25rem;border-top:1px solid var(--border);">
                    <button type="button" class="btn btn-secondary" onclick="renderHome()">Cancel</button>
                    <button type="button" id="save-session-btn" class="btn" style="background:#f59e0b;color:#fff;font-weight:700;box-shadow:0 2px 8px rgba(245,158,11,0.3);" onclick="saveHourlyToSession()">
                        💾 Save Progress
                    </button>
                    <button type="button" class="btn" style="background:#16a34a;color:#fff;font-weight:700;box-shadow:0 2px 8px rgba(22,163,74,0.3);" onclick="generateFromSession()">
                        📄 Generate Shift PDF
                    </button>
                </div>
            </form>
        </div>
    `;
    // Load session data into form
    const _sk = `hourlySession_${machine}`;
    const _sd = JSON.parse(sessionStorage.getItem(_sk) || '{}');
    const _today = new Date().toISOString().split('T')[0];
    const _shared = JSON.parse(localStorage.getItem('hourlySharedInfo') || '{}');
    const _dEl = document.getElementById('hourly-date');
    const _sEl = document.getElementById('hourly-shift');
    const _pEl = document.getElementById('hourly-product');
    if (_dEl) _dEl.value = _sd.date    || _shared.date    || _today;
    if (_sEl) _sEl.value = _sd.shift   || _shared.shift   || 'Day';
    if (_pEl) _pEl.value = _sd.product || _shared.product || '';
    Object.entries(_sd).forEach(([name, val]) => {
        if (['date','shift','product'].includes(name)) return;
        const el = document.querySelector(`#hourly-form [name="${name}"]`);
        if (el) el.value = val;
    });
    if (Object.keys(_sd).length > 3) {
        const _b = document.createElement('div');
        _b.setAttribute('style','position:fixed;bottom:20px;right:20px;background:#16a34a;color:#fff;padding:10px 18px;border-radius:10px;font-size:0.85rem;font-weight:700;box-shadow:0 4px 14px rgba(0,0,0,0.2);z-index:9999;');
        _b.textContent = '✅ Session data restored!';
        document.body.appendChild(_b);
        setTimeout(() => _b.remove(), 3000);
    }
}

// ---- Session Helper Functions ----------------------------------------
function getHourlySessionKey() {
    return 'hourlySession_' + state.currentMachine;
}

function saveHourlyToSession() {
    const form = document.getElementById('hourly-form');
    if (!form) return;
    const data = {};
    form.querySelectorAll('input[name]:not([type="file"]), select[name]').forEach(el => {
        data[el.name] = el.value;
    });
    sessionStorage.setItem(getHourlySessionKey(), JSON.stringify(data));
    if (data.date || data.product) {
        localStorage.setItem('hourlySharedInfo', JSON.stringify({ date: data.date || '', shift: data.shift || 'Day', product: data.product || '' }));
    }
    const btn = document.getElementById('save-session-btn');
    if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '✅ Saved!';
        btn.style.background = '#16a34a';
        setTimeout(() => { btn.innerHTML = orig; btn.style.background = '#f59e0b'; }, 2000);
    }
}

function generateFromSession() {
    saveHourlyToSession();
    const sessionData = JSON.parse(sessionStorage.getItem(getHourlySessionKey()) || '{}');
    if (!sessionData.date) {
        alert('Please fill in Date, Shift and Product first and click Save.');
        return;
    }
    const checkerInput = document.querySelector('[name="sig_checker"]');
    const managerInput = document.querySelector('[name="sig_manager"]');
    const sigError = document.getElementById('sig-error');
    if (!checkerInput || checkerInput.files.length === 0 || !managerInput || managerInput.files.length === 0) {
        if (sigError) {
            sigError.textContent = '⚠️ Please upload both signatures before generating the Shift PDF.';
            sigError.style.display = 'block';
            sigError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    const readFile = (file) => new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
    Promise.all([ readFile(checkerInput.files[0]), readFile(managerInput.files[0]) ])
    .then(([checkerB64, managerB64]) => {
        const finalData = { ...sessionData, sig_checker_base64: checkerB64, sig_manager_base64: managerB64 };
        sessionStorage.removeItem(getHourlySessionKey());
        generateHourlyPDF(finalData);
    });
}
// ----------------------------------------------------------------------


function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // ── Save shared info so next machine form is pre-filled ──────
    if (data.date || data.product) {
        localStorage.setItem('hourlySharedInfo', JSON.stringify({
            date: data.date || '',
            shift: data.shift || 'Day',
            product: data.product || ''
        }));
    }
    // ─────────────────────────────────────────────────────────────

    // ── Signature validation ──────────────────────────
    const checkerFile = formData.get('sig_checker');
    const managerFile = formData.get('sig_manager');
    const sigError = document.getElementById('sig-error');

    if (!checkerFile || checkerFile.size === 0 || !managerFile || managerFile.size === 0) {
        if (sigError) {
            sigError.style.display = 'block';
            sigError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return; // BLOCK submission
    }
    if (sigError) sigError.style.display = 'none';
    // ─────────────────────────────────────────────────

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
                    <tr style="background: #e8edf5;">
                        <th style="border: 1px solid #000; padding: 5px;">SL</th>
                        <th style="border: 1px solid #000; padding: 5px;">PARAMETERS</th>
                        <th style="border: 1px solid #000; padding: 5px;">STATUS</th>
                        <th style="border: 1px solid #000; padding: 5px;">ACTION</th>
                        <th style="border: 1px solid #000; padding: 5px;">REMARKS</th>
                    </tr>
                </thead>
                <tbody>${paramRows}</tbody>
            </table>
            ${state.currentMachine === 'High Pressure Compressor' ? `
            <p style="font-weight:700; font-size:11px; margin: 15px 0 5px; text-transform:uppercase;">🧊 Chiller Check</p>
            <table style="width:100%; border-collapse:collapse; font-size:10px;">
                <thead>
                    <tr style="background:#e0f2fe;">
                        <th style="border:1px solid #000;padding:5px;">SL</th>
                        <th style="border:1px solid #000;padding:5px;">CHILLER PARAMETERS</th>
                        <th style="border:1px solid #000;padding:5px;">STATUS</th>
                        <th style="border:1px solid #000;padding:5px;">ACTION</th>
                        <th style="border:1px solid #000;padding:5px;">REMARKS</th>
                    </tr>
                </thead>
                <tbody>
                    ${(formParameters['Chiller'] || []).map((param, idx) => `
                    <tr>
                        <td style="border:1px solid #000;padding:5px;text-align:center;">${idx+1}</td>
                        <td style="border:1px solid #000;padding:5px;">${param}</td>
                        <td style="border:1px solid #000;padding:5px;text-align:center;">${data['chiller_status_'+idx] || ''}</td>
                        <td style="border:1px solid #000;padding:5px;">${data['chiller_action_'+idx] || ''}</td>
                        <td style="border:1px solid #000;padding:5px;">${data['chiller_remarks_'+idx] || ''}</td>
                    </tr>`).join('')}
                </tbody>
            </table>` : ''}
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

    const mainContainer = document.querySelector('.app-container');
    if (mainContainer) mainContainer.style.display = 'none';

    document.body.appendChild(pdfDiv);
    window.scrollTo(0, 0);
    html2pdf().set({
        filename: `Maintenance_${state.currentMachine}_${data.date}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
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
    // Show next-machine quick buttons only in hourly flow
    const isHourly = state.currentFlow === 'non-daily';
    const machines = [
        { cat: 'Injection', name: 'Yizumi' },
        { cat: 'Injection', name: 'Arburg' },
        { cat: 'ISBM',      name: 'ISBM Machine' }
    ];
    const nextButtons = isHourly ? `
        <div style="margin-top:2rem; padding:1.25rem; background:#eff6ff; border:1.5px solid #2563eb; border-radius:12px;">
            <p style="font-size:0.85rem; font-weight:700; color:#1d4ed8; margin-bottom:0.75rem;">
                ⚡ Fill next machine form (Date &amp; Shift already saved!):
            </p>
            <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:0.6rem;">
                ${machines.filter(m => m.name !== state.currentMachine).map(m =>
                    `<button class="btn btn-secondary" style="border-color:#2563eb;color:#2563eb;" onclick="handleMachineSelect('${m.cat}','${m.name}')">📋 ${m.name}</button>`
                ).join('')}
            </div>
        </div>` : '';

    appContent.innerHTML = `
        <div class="view glass-panel" style="text-align: center; padding: 3rem 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
            <h2 style="color: var(--green); margin-bottom: 0.5rem;">PDF Downloaded Successfully!</h2>
            <p style="color: var(--text-2); margin-bottom: 1.5rem;">The form has been saved to your device.</p>
            ${nextButtons}
            <div style="display: flex; justify-content: center; gap: 1rem; margin-top:1.5rem; flex-wrap:wrap;">
                <button class="btn btn-secondary" onclick="shareData()">Share Form</button>
                <a href="https://wa.me/?text=${encodeURIComponent('Maintenance PDF for ' + state.currentMachine + ' submitted on ' + new Date().toLocaleDateString('en-IN') + '. Check your downloads.')}" target="_blank" class="btn" style="background:#25d366;color:#fff;font-weight:700;text-decoration:none;">💬 WhatsApp</a>
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

// ─── DARK MODE ────────────────────────────────────
function initDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
        const btn = document.getElementById('dark-toggle');
        if (btn) btn.textContent = '☀️ Light';
    }
}
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('darkMode', isDark);
    const btn = document.getElementById('dark-toggle');
    if (btn) btn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
}

// ─── QUICK OK ALL ─────────────────────────────────
function quickOkAll() {
    document.querySelectorAll('.maintenance-table input[type="radio"][value="OK"]').forEach(r => r.checked = true);
    // Visual feedback
    const btn = event.currentTarget;
    const orig = btn.textContent;
    btn.textContent = '✅ All Marked OK!';
    btn.style.background = '#16a34a';
    setTimeout(() => { btn.textContent = orig; btn.style.background = '#2563eb'; }, 1500);
}

// Start
init();
