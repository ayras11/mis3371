// dynamic date js code
const d = new Date();
let text = d.toLocaleDateString();
document.getElementById("today").innerHTML = text;
// dynamic min/max date for DOB
const dobInput = document.getElementById("dob");
if (dobInput) {
    let today = new Date();

    let maxDate = today.toISOString().split("T")[0]; // today
    let minDateObj = new Date();
    minDateObj.setFullYear(today.getFullYear() - 120);
    let minDate = minDateObj.toISOString().split("T")[0];

    dobInput.max = maxDate;
    dobInput.min = minDate;
}

// name slider js code
let slider = document.getElementById("range");
let output = document.getElementById("range-slider");
if (slider && output) {
    output.innerHTML = slider.value;
    slider.oninput = function () {
        output.innerHTML = this.value;
    }; 
}

// Missing Name Validation Functions (Required by your HTML onblur calls)
function validateFname() {
    let fname = document.getElementById("fname").value;
    let rel = /^[a-zA-Z'-]+$/;
    if (fname.length == 0) {
        document.getElementById("fname-error").innerHTML = "First name is required";
        return false;
    } else if (!rel.test(fname)) {
        document.getElementById("fname-error").innerHTML = "Letters, apostrophes, and dashes only";
        return false;
    }
    document.getElementById("fname-error").innerHTML = "";
    return true;
}

function validateMinit() {
    let minit = document.getElementById("minit").value;
    let rel = /^[a-zA-Z]*$/; // letters only, blank ok
    if (!rel.test(minit)) {
        document.getElementById("minit-error").innerHTML = "Letters only";
        return false;
    }
    document.getElementById("minit-error").innerHTML = "";
    return true;
}

function validateLname() {
    let lname = document.getElementById("lname").value;
    let rel = /^[a-zA-Z'2-5\-]+$/;
    if (lname.length == 0) {
        document.getElementById("lname-error").innerHTML = "Last name is required";
        return false;
    } else if (!rel.test(lname)) {
        document.getElementById("lname-error").innerHTML = "Letters, apostrophes, and dashes only";
        return false;
    }
    document.getElementById("lname-error").innerHTML = "";
    return true;
}

function validateDob() {
    let dob = document.getElementById("dob");
let date = new Date(dob.value);

let today = new Date();
let minDate = new Date();
minDate.setFullYear(today.getFullYear() - 120);

if (date > today) {
    document.getElementById("dob-error").innerHTML = "Date can't be in the future";
    dob.value = "";
    return false;
} else if (date < minDate) {
    document.getElementById("dob-error").innerHTML = "Date can't be more than 120 years ago";
    dob.value = "";
    return false;
} else {
    document.getElementById("dob-error").innerHTML = "";
    return true;
}
}

function validateSsn() {
    const ssn = document.getElementById("ssn").value;
    const ssnR = /^[0-9]{3}-?[0-9]{2}-?[0-9]{4}$/;

    if (!ssnR.test(ssn)) {
        document.getElementById("ssn-error").innerHTML = "Please enter a valid SSN (000-00-0000)";
        return false;
    } else {
        document.getElementById("ssn-error").innerHTML = "";
        return true;
    }
}

function validateZcode() {
    const zipInput = document.getElementById("zcode");
    let zip = zipInput.value;

    const zipRegex = /^\d{5}(-\d{4})?$/;

    if (!zipRegex.test(zip)) {
        document.getElementById("zcode-error").innerHTML = "Enter 12345 or 12345-6789";
        return false;
    }

    document.getElementById("zcode-error").innerHTML = "";
    return true;
}

function validateEmail() {
    let email = document.getElementById("email").value;
    var emailR = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
    if (email.length == 0) {
        document.getElementById("email-error").innerHTML = "Email cannot be blank";
        return false;
    } else if (!emailR.test(email)) {
        document.getElementById("email-error").innerHTML = "Enter a valid email address";
        return false;
    }
    document.getElementById("email-error").innerHTML = "";
    return true;
}

function validatePhone() {
    let phoneInput = document.getElementById("phone");
    let phone = phoneInput.value.replace(/\D/g, ""); // remove non-digits
    if (phone.length == 10) {
        phoneInput.value = phone.slice(0,3) + "-" + phone.slice(3,6) + "-" + phone.slice(6,10);
        document.getElementById("phone-error").innerHTML = "";
        return true;
    } else {
        document.getElementById("phone-error").innerHTML = "Enter 10 digits (000-000-0000)";
        return false;
    }
}

function validateUid() {
    let uid = document.getElementById("uid").value.toLowerCase();
    document.getElementById("uid").value = uid;

    if (uid.length == 0) {
        document.getElementById("uid-error").innerHTML = "User ID can't be blank";
        return false;
    }
    if (!isNaN(uid.charAt(0))) {
        document.getElementById("uid-error").innerHTML = "User ID can't start with a number";
        return false;
    }
    let regex = /^[a-zA-Z0-9_-]+$/;
    if (!regex.test(uid)) {
        document.getElementById("uid-error").innerHTML = "Only letters, numbers, underscores, and dashes";
        return false;
    } else if (uid.length < 5 || uid.length > 30) {
        document.getElementById("uid-error").innerHTML = "User ID must be 5-30 characters";
        return false;
    } else {
        document.getElementById("uid-error").innerHTML = "";
        return true;
    }
}
function validatePword() {
    const pass = document.getElementById("pword").value;
    const username = document.getElementById("uid").value;
    const errorMessage = [];

    if (pass.length < 8 || pass.length > 30) errorMessage.push("8-30 characters required");
    if (!pass.match(/[a-z]/)) errorMessage.push("Enter at least one lowercase letter");
    if (!pass.match(/[A-Z]/)) errorMessage.push("Enter at least one uppercase letter");
    if (!pass.match(/[0-9]/)) errorMessage.push("Enter at least one number");
    if (!pass.match(/[!\@#\$%&*\-_\.\\\+\(\)]/)) errorMessage.push("Enter at least one special character");
    if (pass.includes('"')) errorMessage.push("Double quotes are not allowed"); // Rubric requirement
    if (username && (pass == username || pass.includes(username))) errorMessage.push("Password cannot contain username");

    const errorContainer = document.querySelector(".pword-message");
    errorContainer.innerHTML = errorMessage.map(msg => `<span>${msg}</span>`).join("<br>");
    return errorMessage.length === 0;
}

function confirmRepword() {
    let pword1 = document.getElementById("pword").value;
    let pword2 = document.getElementById("repword").value;

    if (pword1 !== pword2) {
        document.getElementById("repword-error").innerHTML = "Passwords don't match";
        return false;
    } else {
        document.getElementById("repword-error").innerHTML = "Passwords match";
        return true;
    }
}

function reviewInput() {
    var formcontent = document.querySelector("form");
    var formoutput = "<table class='output'><tr><th colspan='2'>Review Your Information:</th></tr>";
    let historyValues = [];

    const labelMap = {
        fname: "First Name",
        minit: "Middle Initial",
        lname: "Last Name",
        pgender: "Gender",
        dob: "Date of Birth",
        ssn: "Social Security Number",
        phone: "Phone Number",
        address1: "Address Line 1",
        address2: "Address Line 2",
        city: "City",
        state: "State",
        zcode: "Zip Code",
        vaccinated: "Vaccinated",
        range: "Health Rating",
        symptoms: "Symptoms",
        email: "Email Address",
        uid: "User ID",
        pword: "Password",
        repword: "Confirm Password"
    };

    for (var i = 0; i < formcontent.elements.length; i++) {
        var el = formcontent.elements[i];
        var datatype = el.type;

        if (!el.name) continue;

        var label = labelMap[el.name] || el.name;
        var value = el.value;

        switch (datatype) {
            case "checkbox":
                if (el.checked) {
                    historyValues.push(el.value);
                }
                break;

            case "radio":
                if (el.checked) {
                    formoutput += "<tr><td align='right'>" + label + "</td>";
                    formoutput += "<td class='outputdata'>" + value + "</td></tr>";
                }
                break;

            case "range":
                formoutput += "<tr><td align='right'>" + label + "</td>";
                formoutput += "<td class='outputdata'>" + value + "</td></tr>";
                break;

            case "button":
            case "submit":
            case "reset":
                break;

            default:
                if (value !== "") {
                    formoutput += "<tr><td align='right'>" + label + "</td>";
                    formoutput += "<td class='outputdata'>" + value + "</td></tr>";
                }
        }
    }

    if (historyValues.length > 0) {
        formoutput += "<tr><td align='right'>Medical History</td>";
        formoutput += "<td class='outputdata'>" + historyValues.join(", ") + "</td></tr>";
    }

    formoutput += "</table>";
    document.getElementById("showInput").innerHTML = formoutput;
}

function removeReview() {
    document.getElementById("showInput").innerHTML = "";
}

function validateForm() {
    return (
        validateFname() &&
        validateLname() &&
        validateDob() &&
        validateSsn() &&
        validatePhone() &&
        validateEmail() &&
        validateUid() &&
        validatePword() &&
        confirmRepword()
    );
}