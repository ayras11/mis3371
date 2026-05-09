// =====================================================================
// hw4.js  –  Siddiqui Clinic Patient Intake  |  Version 4.0
// Author : Ayra Siddiqui
// New in 4.0: Cookies, Local Storage, Fetch API (states), Remember Me,
//             Welcome message, on-submit cookie save
// =====================================================================

// ── Dynamic date ──────────────────────────────────────────────────────
const d = new Date();
document.getElementById("today").innerHTML = d.toLocaleDateString();

// ── Dynamic min/max for DOB ───────────────────────────────────────────
const dobInput = document.getElementById("dob");
if (dobInput) {
    let today = new Date();
    dobInput.max = today.toISOString().split("T")[0];
    let minDateObj = new Date();
    minDateObj.setFullYear(today.getFullYear() - 120);
    dobInput.min = minDateObj.toISOString().split("T")[0];
}

// ── Slider dynamic display ────────────────────────────────────────────
let slider = document.getElementById("range");
let sliderOut = document.getElementById("range-slider");
if (slider && sliderOut) {
    sliderOut.innerHTML = slider.value;
    slider.oninput = function () { sliderOut.innerHTML = this.value; };
}

// ── SSN auto-format (insert dashes as user types) ────────────────────
const ssnInput = document.getElementById("ssn");
if (ssnInput) {
    ssnInput.addEventListener("input", function () {
        let digits = this.value.replace(/\D/g, "").substring(0, 9);
        if (digits.length > 5) {
            this.value = digits.slice(0,3) + "-" + digits.slice(3,5) + "-" + digits.slice(5);
        } else if (digits.length > 3) {
            this.value = digits.slice(0,3) + "-" + digits.slice(3);
        } else {
            this.value = digits;
        }
    });
}

// =====================================================================
// COOKIES  (HW4 NEW)
// =====================================================================

// Save a cookie with a name, value, and expiration in days
function setCookie(name, cvalue, expiryDays) {
    var day = new Date();
    day.setTime(day.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + day.toUTCString();
    document.cookie = name + "=" + cvalue + ";" + expires + ";path=/";
}

// Read a cookie by name; returns "" if not found
function getCookie(name) {
    var cookieName = name + "=";
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf(cookieName) == 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
}

// Expire all cookies (used when "Remember Me" is unchecked or user resets)
function deleteAllCookies() {
    document.cookie.split(";").forEach(function (cookie) {
        let eqPos = cookie.indexOf("=");
        let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    });
}

// =====================================================================
// LOCAL STORAGE  (HW4 NEW)
// =====================================================================

// Non-sensitive fields that are safe to save in Local Storage
// (SSN and password are intentionally excluded)
const lsFields = [
    { id: "fname",    key: "ls_fname"    },
    { id: "mini",     key: "ls_mini"     },
    { id: "lname",    key: "ls_lname"    },
    { id: "phone",    key: "ls_phone"    },
    { id: "address1", key: "ls_address1" },
    { id: "address2", key: "ls_address2" },
    { id: "city",     key: "ls_city"     },
    { id: "zcode",    key: "ls_zcode"    },
    { id: "email",    key: "ls_email"    },
    { id: "uid",      key: "ls_uid"      },
    { id: "symptoms", key: "ls_symptoms" }
];

// Save all non-sensitive fields to Local Storage
function saveToLocalStorage() {
    lsFields.forEach(function (field) {
        var el = document.getElementById(field.id);
        if (el) localStorage.setItem(field.key, el.value);
    });
    // Also save state selection and slider value
    var stateEl = document.getElementById("state");
    if (stateEl) localStorage.setItem("ls_state", stateEl.value);
    var rangeEl = document.getElementById("range");
    if (rangeEl) localStorage.setItem("ls_range", rangeEl.value);
}

// Read all Local Storage values back into the form fields
function loadFromLocalStorage() {
    lsFields.forEach(function (field) {
        var el  = document.getElementById(field.id);
        var val = localStorage.getItem(field.key);
        if (el && val !== null && val !== "") {
            el.value = val;
        }
    });
    // Restore state dropdown (called again after Fetch populates options)
    restoreSavedState();
    // Restore slider
    var savedRange = localStorage.getItem("ls_range");
    if (savedRange) {
        var rangeEl = document.getElementById("range");
        if (rangeEl) {
            rangeEl.value = savedRange;
            var rangeDisplay = document.getElementById("range-slider");
            if (rangeDisplay) rangeDisplay.innerHTML = savedRange;
        }
    }
}

// Re-select the saved state after Fetch has populated the <select>
function restoreSavedState() {
    var savedState = localStorage.getItem("ls_state");
    if (savedState) {
        var stateEl = document.getElementById("state");
        if (stateEl) stateEl.value = savedState;
    }
}

// Remove all Local Storage keys belonging to this form
function clearLocalStorage() {
    lsFields.forEach(function (field) {
        localStorage.removeItem(field.key);
    });
    localStorage.removeItem("ls_state");
    localStorage.removeItem("ls_range");
}

// =====================================================================
// FETCH API  –  Load state options from states.json  (HW4 NEW)
// =====================================================================

// Fallback list used when Fetch is blocked (e.g. file:// protocol locally)
const STATES_FALLBACK = [
    {value:"AL",label:"Alabama"},{value:"AK",label:"Alaska"},
    {value:"AZ",label:"Arizona"},{value:"AR",label:"Arkansas"},
    {value:"CA",label:"California"},{value:"CO",label:"Colorado"},
    {value:"CT",label:"Connecticut"},{value:"DE",label:"Delaware"},
    {value:"DC",label:"District of Columbia"},{value:"FL",label:"Florida"},
    {value:"GA",label:"Georgia"},{value:"HI",label:"Hawaii"},
    {value:"ID",label:"Idaho"},{value:"IL",label:"Illinois"},
    {value:"IN",label:"Indiana"},{value:"IA",label:"Iowa"},
    {value:"KS",label:"Kansas"},{value:"KY",label:"Kentucky"},
    {value:"LA",label:"Louisiana"},{value:"ME",label:"Maine"},
    {value:"MD",label:"Maryland"},{value:"MA",label:"Massachusetts"},
    {value:"MI",label:"Michigan"},{value:"MN",label:"Minnesota"},
    {value:"MS",label:"Mississippi"},{value:"MO",label:"Missouri"},
    {value:"MT",label:"Montana"},{value:"NE",label:"Nebraska"},
    {value:"NV",label:"Nevada"},{value:"NH",label:"New Hampshire"},
    {value:"NJ",label:"New Jersey"},{value:"NM",label:"New Mexico"},
    {value:"NY",label:"New York"},{value:"NC",label:"North Carolina"},
    {value:"ND",label:"North Dakota"},{value:"OH",label:"Ohio"},
    {value:"OK",label:"Oklahoma"},{value:"OR",label:"Oregon"},
    {value:"PA",label:"Pennsylvania"},{value:"PR",label:"Puerto Rico"},
    {value:"RI",label:"Rhode Island"},{value:"SC",label:"South Carolina"},
    {value:"SD",label:"South Dakota"},{value:"TN",label:"Tennessee"},
    {value:"TX",label:"Texas"},{value:"UT",label:"Utah"},
    {value:"VT",label:"Vermont"},{value:"VA",label:"Virginia"},
    {value:"WA",label:"Washington"},{value:"WV",label:"West Virginia"},
    {value:"WI",label:"Wisconsin"},{value:"WY",label:"Wyoming"}
];

// Populate the <select> from an array of {value, label} objects
function populateStateSelect(states) {
    var select = document.getElementById("state");
    select.innerHTML = '<option value="" selected disabled>Please Select One</option>';
    states.forEach(function (s) {
        var opt = document.createElement("option");
        opt.value       = s.value;
        opt.textContent = s.label;
        select.appendChild(opt);
    });
    restoreSavedState();
    select.addEventListener("change", function () {
        if (isRememberMeChecked()) {
            localStorage.setItem("ls_state", select.value);
        }
    });
}

async function loadStates() {
    var select = document.getElementById("state");
    try {
        const response = await fetch("states.json");
        if (!response.ok) throw new Error("Server returned " + response.status);
        const states = await response.json();
        console.log("States loaded via Fetch API.");
        populateStateSelect(states);

    } catch (err) {
        // fetch() is blocked on file:// (browser CORS restriction) –
        // fall back to the hardcoded array so the form still works locally.
        console.warn("Fetch blocked (likely file:// protocol) – using fallback list.", err.message);
        populateStateSelect(STATES_FALLBACK);
    }
}

// =====================================================================
// HELPER
// =====================================================================
function isRememberMeChecked() {
    var cb = document.getElementById("remember-me");
    return cb ? cb.checked : false;
}

// =====================================================================
// DOM CONTENT LOADED  (HW4 NEW)  – runs after page is fully parsed
// =====================================================================
document.addEventListener("DOMContentLoaded", function () {

    // 1. Load state options via Fetch API
    loadStates();

    // ── Welcome message / cookie check ──────────────────────────────
    var firstName = getCookie("firstName");

    if (firstName !== "") {
        // Returning user: personalized greeting
        document.getElementById("welcome1").innerHTML =
            "Welcome back, " + firstName + "!<br>";
        document.getElementById("welcome2").innerHTML =
            "<a href='#' id='new-user'>Not " + firstName +
            "? Click here to start as a new user.</a>";

        // "Not me" link – wipe cookies + local storage and reload
        document.getElementById("new-user").addEventListener("click", function (e) {
            e.preventDefault();
            deleteAllCookies();
            clearLocalStorage();
            location.reload();
        });

        // Pre-fill form with Local Storage data (if Remember Me was on)
        loadFromLocalStorage();

        // Also pre-fill First Name from cookie
        var fnameEl = document.getElementById("fname");
        if (fnameEl && fnameEl.value === "") fnameEl.value = firstName;

    } else {
        // New / first-time visitor
        document.getElementById("welcome1").innerHTML =
            "Welcome, New Patient!<br>";
        document.getElementById("welcome2").innerHTML =
            "Please fill out the form below to create your account.";
    }

    // ── Remember Me: on page load, clear data if unchecked ──────────
    var rememberMeCb = document.getElementById("remember-me");
    if (rememberMeCb && !rememberMeCb.checked) {
        deleteAllCookies();
        clearLocalStorage();
    }

    // ── Attach input listeners – save to Local Storage on every change ──
    lsFields.forEach(function (field) {
        var el = document.getElementById(field.id);
        if (!el) return;

        el.addEventListener("input", function () {
            if (!isRememberMeChecked()) return;   // only save when checked
            localStorage.setItem(field.key, el.value);

            // Special case: keep the firstName cookie up-to-date
            if (field.id === "fname" && el.value.trim() !== "") {
                setCookie("firstName", el.value.trim(), 2); // 48-hour expiry
            }
        });
    });

    // ── Remember Me checkbox change handler ─────────────────────────
    if (rememberMeCb) {
        rememberMeCb.addEventListener("change", function () {
            if (!this.checked) {
                // User unchecked – remove everything
                deleteAllCookies();
                clearLocalStorage();
                console.log("Remember Me unchecked – all cookies and local storage cleared.");
            } else {
                // User re-checked – save current form state immediately
                var fnameEl = document.getElementById("fname");
                if (fnameEl && fnameEl.value.trim() !== "") {
                    setCookie("firstName", fnameEl.value.trim(), 2);
                }
                saveToLocalStorage();
                console.log("Remember Me checked – cookies and local storage saved.");
            }
        });
    }
});

// =====================================================================
// ALERT BOX
// =====================================================================
function showAlert() {
    var alertBox   = document.getElementById("alert-box");
    var closeAlert = document.getElementById("close-alert");
    alertBox.style.display = "block";
    closeAlert.onclick = function () {
        alertBox.style.display = "none";
    };
}

// =====================================================================
// VALIDATE EVERYTHING  –  called by the Validate button
// =====================================================================
function validateEverything() {
    let valid = true;

    if (!validateFname())    valid = false;
    if (!validateMini())     valid = false;
    if (!validateLname())    valid = false;
    if (!validateDob())      valid = false;
    if (!validateSsn())      valid = false;
    if (!validateAddress1()) valid = false;
    if (!validateAddress2()) valid = false;
    if (!validateCity())     valid = false;
    if (!validateZcode())    valid = false;
    if (!validateEmail())    valid = false;
    if (!validatePhone())    valid = false;
    if (!validateUid())      valid = false;
    if (!validatePword())    valid = false;
    if (!confirmPword())     valid = false;

    let submitBtn = document.getElementById("submit");
    if (valid) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
        submitBtn.title = "All fields look good – click to submit!";
    } else {
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.4";
        showAlert();
    }
    return valid;
}

// =====================================================================
// FIELD VALIDATORS  (unchanged from HW3)
// =====================================================================

// ── First Name ────────────────────────────────────────────────────────
function validateFname() {
    let fname = document.getElementById("fname").value.trim();
    const namePattern = /^[a-zA-Z'-]+$/;

    if (fname === "") {
        document.getElementById("fname-error").innerHTML = "First name cannot be empty.";
        return false;
    } else if (!namePattern.test(fname)) {
        document.getElementById("fname-error").innerHTML = "Letters, apostrophes, and dashes only.";
        return false;
    } else if (fname.length < 2) {
        document.getElementById("fname-error").innerHTML = "First name must be at least 2 characters.";
        return false;
    } else if (fname.length > 30) {
        document.getElementById("fname-error").innerHTML = "First name cannot exceed 30 characters.";
        return false;
    }
    document.getElementById("fname-error").innerHTML = "";
    return true;
}

// ── Middle Initial  (optional – blank is fine) ────────────────────────
function validateMini() {
    let mini = document.getElementById("mini").value.trim();

    if (mini === "") {
        document.getElementById("mini-error").innerHTML = "";
        return true;
    }
    mini = mini.toUpperCase();
    document.getElementById("mini").value = mini;

    if (!/^[A-Z]$/.test(mini)) {
        document.getElementById("mini-error").innerHTML = "Middle initial must be a single uppercase letter.";
        return false;
    }
    document.getElementById("mini-error").innerHTML = "";
    return true;
}

// ── Last Name ─────────────────────────────────────────────────────────
function validateLname() {
    let lname = document.getElementById("lname").value.trim();
    const namePattern = /^[a-zA-Z'-]+$/;

    if (lname === "") {
        document.getElementById("lname-error").innerHTML = "Last name cannot be empty.";
        return false;
    } else if (!namePattern.test(lname)) {
        document.getElementById("lname-error").innerHTML = "Letters, apostrophes, and dashes only.";
        return false;
    } else if (lname.length < 1) {
        document.getElementById("lname-error").innerHTML = "Last name must be at least 1 character.";
        return false;
    } else if (lname.length > 30) {
        document.getElementById("lname-error").innerHTML = "Last name cannot exceed 30 characters.";
        return false;
    }
    document.getElementById("lname-error").innerHTML = "";
    return true;
}

// ── Date of Birth ─────────────────────────────────────────────────────
function validateDob() {
    let dob   = document.getElementById("dob");
    let value = dob.value;

    if (!value) {
        document.getElementById("dob-error").innerHTML = "Date of birth is required.";
        return false;
    }
    let date    = new Date(value + "T00:00:00");
    let today   = new Date(); today.setHours(0,0,0,0);
    let minDate = new Date(); minDate.setFullYear(today.getFullYear() - 120); minDate.setHours(0,0,0,0);

    if (date > today) {
        document.getElementById("dob-error").innerHTML = "Date of birth cannot be in the future.";
        dob.value = "";
        return false;
    } else if (date < minDate) {
        document.getElementById("dob-error").innerHTML = "Date cannot be more than 120 years ago.";
        dob.value = "";
        return false;
    }
    document.getElementById("dob-error").innerHTML = "";
    return true;
}

// ── Social Security Number ────────────────────────────────────────────
function validateSsn() {
    const ssn  = document.getElementById("ssn").value;
    const ssnR = /^\d{3}-\d{2}-\d{4}$/;

    if (!ssnR.test(ssn)) {
        document.getElementById("ssn-error").innerHTML = "Enter a valid SSN in the format 000-00-0000.";
        return false;
    }
    document.getElementById("ssn-error").innerHTML = "";
    return true;
}

// ── Address Line 1 ────────────────────────────────────────────────────
function validateAddress1() {
    let addr = document.getElementById("address1").value.trim();

    if (addr === "") {
        document.getElementById("address1-error").innerHTML = "Address Line 1 is required.";
        return false;
    } else if (addr.length < 2) {
        document.getElementById("address1-error").innerHTML = "Address must be at least 2 characters.";
        return false;
    } else if (addr.length > 30) {
        document.getElementById("address1-error").innerHTML = "Address cannot exceed 30 characters.";
        return false;
    }
    document.getElementById("address1-error").innerHTML = "";
    return true;
}

// ── Address Line 2 ────────────────────────────────────────────────────
function validateAddress2() {
    let addr = document.getElementById("address2").value.trim();

    if (addr === "") {
        document.getElementById("address2-error").innerHTML = "";
        return true;
    }
    if (addr.length < 2) {
        document.getElementById("address2-error").innerHTML = "Address Line 2 must be at least 2 characters.";
        return false;
    } else if (addr.length > 30) {
        document.getElementById("address2-error").innerHTML = "Address Line 2 cannot exceed 30 characters.";
        return false;
    }
    document.getElementById("address2-error").innerHTML = "";
    return true;
}

// ── City ──────────────────────────────────────────────────────────────
function validateCity() {
    let city = document.getElementById("city").value.trim();

    if (!city) {
        document.getElementById("city-error").innerHTML = "City can't be blank.";
        return false;
    } else if (city.length < 2) {
        document.getElementById("city-error").innerHTML = "City must be at least 2 characters.";
        return false;
    } else if (city.length > 30) {
        document.getElementById("city-error").innerHTML = "City cannot exceed 30 characters.";
        return false;
    }
    document.getElementById("city-error").innerHTML = "";
    return true;
}

// ── Zip Code ──────────────────────────────────────────────────────────
function validateZcode() {
    let zip      = document.getElementById("zcode").value.trim();
    const zipReg = /^\d{5}(-\d{4})?$/;

    if (!zipReg.test(zip)) {
        document.getElementById("zcode-error").innerHTML = "Enter 12345 or 12345-6789.";
        return false;
    }
    document.getElementById("zcode-error").innerHTML = "";
    return true;
}

// ── Email ─────────────────────────────────────────────────────────────
function validateEmail() {
    let email  = document.getElementById("email").value.trim().toLowerCase();
    document.getElementById("email").value = email;
    const emailR = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;

    if (email.length === 0) {
        document.getElementById("email-error").innerHTML = "Email address cannot be blank.";
        return false;
    } else if (!emailR.test(email)) {
        document.getElementById("email-error").innerHTML = "Enter a valid email address (name@domain.tld).";
        return false;
    }
    document.getElementById("email-error").innerHTML = "";
    return true;
}

// ── Phone ─────────────────────────────────────────────────────────────
function validatePhone() {
    let phoneInput = document.getElementById("phone");
    let digits     = phoneInput.value.replace(/\D/g, "");

    if (digits.length === 10) {
        phoneInput.value = digits.slice(0,3) + "-" + digits.slice(3,6) + "-" + digits.slice(6,10);
        document.getElementById("phone-error").innerHTML = "";
        return true;
    }
    document.getElementById("phone-error").innerHTML = "Enter 10 digits (000-000-0000).";
    return false;
}

// ── User ID ───────────────────────────────────────────────────────────
function validateUid() {
    let uid = document.getElementById("uid").value.toLowerCase();
    document.getElementById("uid").value = uid;

    if (uid.length === 0) {
        document.getElementById("uid-error").innerHTML = "User ID can't be blank.";
        return false;
    }
    if (!isNaN(uid.charAt(0))) {
        document.getElementById("uid-error").innerHTML = "User ID can't start with a number.";
        return false;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(uid)) {
        document.getElementById("uid-error").innerHTML = "Only letters, numbers, underscores, and dashes allowed.";
        return false;
    }
    if (uid.length < 5 || uid.length > 20) {
        document.getElementById("uid-error").innerHTML = "User ID must be 5–20 characters.";
        return false;
    }
    document.getElementById("uid-error").innerHTML = "";
    return true;
}

// ── Password ──────────────────────────────────────────────────────────
function validatePword() {
    const pass     = document.getElementById("pword").value;
    const username = document.getElementById("uid").value;
    const errors   = [];

    if (pass.length < 8 || pass.length > 30)
        errors.push("8–30 characters required.");
    if (!pass.match(/[a-z]/))
        errors.push("At least one lowercase letter.");
    if (!pass.match(/[A-Z]/))
        errors.push("At least one uppercase letter.");
    if (!pass.match(/[0-9]/))
        errors.push("At least one number.");
    if (!pass.match(/[!@#$%&*\-_.\\\+\(\)]/))
        errors.push("At least one special character (!@#$%&*-_.).");
    if (pass.includes('"'))
        errors.push("Double quotes are not allowed.");
    if (username && (pass === username || pass.includes(username)))
        errors.push("Password cannot contain your User ID.");

    document.querySelector(".pword-message").innerHTML =
        errors.map(m => `<span>${m}</span>`).join("<br>");
    return errors.length === 0;
}

function confirmPword() {
    let p1 = document.getElementById("pword").value;
    let p2 = document.getElementById("repword").value;

    if (p1 !== p2) {
        document.getElementById("repword-error").innerHTML = "Passwords don't match.";
        return false;
    }
    document.getElementById("repword-error").innerHTML = "&#10004; Passwords match.";
    return true;
}

const confirmRepword = confirmPword;

// ── Review / Remove Review ────────────────────────────────────────────
function reviewInput() {
    var form       = document.querySelector("form");
    var out        = "<table class='output'><tr><th colspan='2'>Review Your Information:</th></tr>";
    let histVals   = [];

    const labelMap = {
        fname:"First Name", mini:"Middle Initial", lname:"Last Name",
        pgender:"Gender", dob:"Date of Birth", ssn:"Social Security Number",
        phone:"Phone Number", address1:"Address Line 1", address2:"Address Line 2",
        city:"City", state:"State", zcode:"Zip Code",
        vaccinated:"Vaccinated", range:"Health Rating",
        symptoms:"Symptoms", email:"Email Address",
        uid:"User ID", pword:"Password", repword:"Confirm Password"
    };

    for (var i = 0; i < form.elements.length; i++) {
        var el    = form.elements[i];
        var dtype = el.type;
        if (!el.name) continue;
        var label = labelMap[el.name] || el.name;
        var value = el.value;

        switch (dtype) {
            case "checkbox":
                if (el.checked && el.name !== "remember-me") histVals.push(el.value);
                break;
            case "radio":
                if (el.checked)
                    out += `<tr><td align='right'>${label}</td><td class='outputdata'>${value}</td></tr>`;
                break;
            case "range":
                out += `<tr><td align='right'>${label}</td><td class='outputdata'>${value}</td></tr>`;
                break;
            case "button": case "submit": case "reset": break;
            default:
                if (value !== "")
                    out += `<tr><td align='right'>${label}</td><td class='outputdata'>${value}</td></tr>`;
        }
    }
    if (histVals.length > 0)
        out += `<tr><td align='right'>Medical History</td><td class='outputdata'>${histVals.join(", ")}</td></tr>`;

    out += "</table>";
    document.getElementById("showInput").innerHTML = out;
}

function removeReview() {
    document.getElementById("showInput").innerHTML = "";
}

// ── Form submit handler ───────────────────────────────────────────────
// Saves firstName cookie before navigating to thankyou.html
function validateForm() {
    if (!validateEverything()) return false;

    // If valid AND "Remember Me" is checked, persist the cookie
    if (isRememberMeChecked()) {
        var fnameEl = document.getElementById("fname");
        if (fnameEl && fnameEl.value.trim() !== "") {
            setCookie("firstName", fnameEl.value.trim(), 2); // 48 hours
        }
        saveToLocalStorage();
    } else {
        deleteAllCookies();
        clearLocalStorage();
    }
    return true;
}
