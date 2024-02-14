const urlBase = 'http://cop4331-echo.xyz/';

userId = 0;
let firstName = '';
let lastName = '';

// True = Edit; False = Add
let isEditing = false; 

// Store current contact ID being edited
let contactId; 

// Validation patterns
const patterns = {
    name: /^[a-zA-Z-']+$/,
    phone: /^[0-9]{10}$/,
    email: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
    password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,32}$/
};

// Initialize application
document.addEventListener("DOMContentLoaded", function () {
    // Check if there are elements with validation data on the page
    if (document.querySelector('input[data-validation]')) {
        validateOnLoadAndInput();
    }

    if (document.getElementById('add-button')) {
        console.log("Contacts page detected.");
        // Initialize contact event listeners and other page-specific logic
        initializeContactEventListeners();
        initializeContacts();
    } else if (document.getElementById('loginForm')) {
        console.log("Login page detected.");
        // Initialize login page specific logic
        setupLoginSignup();
    }

    // Redirect to login if attempt to access contact page without being logged in
    const contactsLink = document.getElementById('contacts-link');
    if (contactsLink) {
        contactsLink.addEventListener('click', function(event) {
            event.preventDefault(); 
            checkLogin(); 
        });
    }
});

// ----------------------------------------------------
// Login / Signup
// ----------------------------------------------------

// Setup form listeners
function setupLoginSignup() {
    setupToggleButtons();
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
}

function handleLogin(e) {
    e.preventDefault();
    let email = document.querySelector('[name="loginEmail"]').value;
    let password = document.querySelector('[name="loginPassword"]').value;
    let payload = { login: email, password: password };

    sendAjaxRequest('Login.php', payload, (response) => {
        if (response.id > 0) {
            userId = response.id;
            sessionStorage.setItem('userId', response.id);
            firstName = response.firstName;
            lastName = response.lastName;
            window.location.href = "contacts.html";
        } else {
            const loginResult = document.getElementById('loginResult');
            if (loginResult) {
                loginResult.textContent = "User doesn't exist."
            }
        }
    });
}

function handleSignup(e) {
    e.preventDefault();
    let newUser = {
        firstName: document.querySelector('[name="signupFirstName"]').value.trim(),
        lastName: document.querySelector('[name="signupLastName"]').value.trim(),
        login: document.querySelector('[name="signupEmail"]').value.trim(),
        password: document.querySelector('[name="signupPassword"]').value
    };

    if (!newUser.firstName || !newUser.lastName || !newUser.login || !newUser.password) {
        displaySignupResult("All fields must be filled out");
        return;
    }

    sendAjaxRequest('Signup.php', newUser, (response) => {
        const signupResult = document.getElementById('signupResult');
        if (response.id > 0) {
            displaySignupResult("Signup successful :)", true);
        } else {
            displaySignupResult(response.error || "Signup failed :(", false);
        }
    });
}

function displaySignupResult(message, isSuccess) {
    const signupResult = document.getElementById('signupResult'); 
    if (signupResult) {
        signupResult.textContent = message;
        signupResult.style.display = 'block';
        signupResult.style.color = isSuccess ? 1 : 0;
        if (isSuccess) {
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
        }
    }
}

// Gather form data
function gatherFormData(action) {
    let email, password, firstName, lastName;
    if (action === 'Login') {
        email = document.querySelector('[name="loginEmail"]').value;
        password = document.querySelector('[name="loginPassword"]').value;
    } else { // Signup
        firstName = document.querySelector('[name="signupFirstName"]').value;
        lastName = document.querySelector('[name="signupLastName"]').value;
        email = document.querySelector('[name="signupEmail"]').value;
        password = document.querySelector('[name="signupPassword"]').value;
    }
    return JSON.stringify({ firstName, lastName, login: email, password: password }); 
}

function handleAuthResponse(response, action) {
    if (response.id > 0) {
        userId = response.id;
        if (action === 'Login') {
            window.location.href = "contacts.html";
        } else { // Signup
            document.getElementById("signupResult").innerHTML = "User added successfully!";
            window.location.href = "login.html";
        }
    } else {
        document.getElementById(`${action.toLowerCase()}Result`).innerHTML = response.error || "Error during authentication.";
    }
}

function setupToggleButtons() {
    const loginBtn = document.getElementById('login-toggle-btn');
    const signupBtn = document.getElementById('signup-toggle-btn');

    loginBtn.addEventListener('click', function() {
        toggleFormVisibility('login');
    });

    signupBtn.addEventListener('click', function() {
        toggleFormVisibility('signup');
    });

    toggleFormVisibility('login');
}

function toggleFormVisibility(formType) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginBtn = document.getElementById('login-toggle-btn');
    const signupBtn = document.getElementById('signup-toggle-btn');

    if (formType === 'login') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        loginBtn.classList.add('active', 'btn-primary');
        signupBtn.classList.remove('active', 'btn-primary');
        signupBtn.classList.add('btn-secondary');
    } else { // Signup
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        signupBtn.classList.add('active', 'btn-primary');
        loginBtn.classList.remove('active', 'btn-primary');
        loginBtn.classList.add('btn-secondary');
    }
}

// ----------------------------------------------------
// Validation
// ----------------------------------------------------

function validateOnLoadAndInput() {
    document.querySelectorAll('input[data-validation]').forEach(input => {
        // Trigger validation immediately for each field
        triggerValidation(input);

        // Add input event listener for dynamic validation
        input.addEventListener('input', function() {
            triggerValidation(input);
        });
    });
}

// Helper function to trigger validation
function triggerValidation(input) {
    const validationType = input.getAttribute('data-validation');
    const validationResult = validateField(validationType, input.value, input.name);
    updateValidationFeedback(validationResult, input.name); 
}

// Update UI based on validation results using name to find the input element
function updateValidationFeedback(result, inputElementName) {
    const inputElement = document.querySelector(`input[name="${inputElementName}"]`);
    
    // Handle the case where inputElement might be null
    if (inputElement) {
        if (result.isValid) {
            inputElement.classList.add('is-valid');
            inputElement.classList.remove('is-invalid');
        } else {
            inputElement.classList.add('is-invalid');
            inputElement.classList.remove('is-valid');
        }
        const feedbackElement = inputElement.nextElementSibling;
        if (feedbackElement) {
            feedbackElement.textContent = result.message;
        }
    }
}

function validateField(validationType, value) {
    let result = { isValid: false, message: 'Invalid input' }; // Default result
    switch (validationType) {
        case 'email':
            result.isValid = patterns.email.test(value);
            result.message = result.isValid ? 'Email looks good!' : 'Invalid email';
            break;
        case 'password':
            result.isValid = patterns.password.test(value);
            result.message = result.isValid ? 'Password looks good!' : 'Invalid password';
            break;
        case 'name':
            result.isValid = patterns.name.test(value);
            result.message = result.isValid ? 'Name looks good!' : 'Invalid name';
            break;
        case 'phone':
            result.isValid = value.trim() === '' || patterns.phone.test(value);
            result.message = result.isValid ? 'Phone number looks good!' : 'Invalid phone number';
            break;
        default:
            console.error('Unknown validation type:', validationType);
            break;
    }

    if (value.trim() === '' && validationType !== 'phone') {
        result.isValid = false;
        result.message = 'This field is required';
    }
    return result;
}

function validateEmail(email) {
    if (email.trim() === "") return { isValid: false, message: "Email is required" };
    return {
        isValid: patterns.email.test(email),
        message: patterns.email.test(email) ? "Email looks good!" : "Invalid email"
    };
}

function validateName(name) {
    if (password === "") return { isValid: false, message: "Password is required" };
    return {
        isValid: patterns.name.test(name),
        message: patterns.name.test(name) ? "Name looks good!" : "Invalid name"
    };
}

function validatePassword(password) {
    if (password === "") return { isValid: false, message: "Password is required" };
    return {
        isValid: patterns.password.test(password),
        message: patterns.password.test(password) ? "Password looks good!" : "Invalid password"
    };
}

// ----------------------------------------------------
// Utility
// ----------------------------------------------------

function checkLogin() {
    const userId = sessionStorage.getItem('userId');
    if (!userId || userId <= 0) {
        window.location.href = "login.html"; // Redirect to the login page
    }
}

// General AJAX request function
function sendAjaxRequest(endpoint, data, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + 'LAMPAPI/' + endpoint, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            console.log("Response received: ", this.responseText);
            try {
                let response = JSON.parse(this.responseText);
                callback(response);
            } catch (err) {
                console.error("Error parsing response: ", err, this.responseText);
                callback({ error: "Invalid server response." });
            }
        }
    };
    xhr.send(JSON.stringify(data));
}

// ----------------------------------------------------
// Contact Manager
// ----------------------------------------------------

function setupContactPopup(contactIdToEdit) {
    const isEditingMode = contactIdToEdit !== undefined && contactIdToEdit !== null;

    isEditing = isEditingMode;
    contactId = isEditingMode ? contactIdToEdit : null;

    document.getElementById('contact-form').reset();
    resetValidationMessages();

    const contactInfoButton = document.getElementById('contact-info-button');
    contactInfoButton.textContent = isEditingMode ? 'Update' : 'Add';
    contactInfoButton.onclick = isEditingMode ? editContact : addContact;

    console.log("contactIdToEdit: ", contactIdToEdit);
    if (isEditingMode) {
        loadContactData(contactIdToEdit); 
    }

    document.getElementById('contact-popup').style.display = 'flex';
}

function closeContactPopup() {
    document.getElementById('overlay').style.display = 'none'; 
    document.getElementById('contact-popup').style.display = 'none'; 
}

function loadContactData(contactIdToEdit) {
    const endpoint = 'GetContact.php'; 
    const data = { ID: contactIdToEdit };

    sendAjaxRequest(endpoint, data, function(response) {
        if (response && response.FirstName) { 
            document.getElementById('firstName').value = response.FirstName || '';
            document.getElementById('lastName').value = response.LastName || '';
            document.getElementById('email').value = response.Email || '';
            document.getElementById('phone').value = response.Phone || '';
        } else {
            console.error('No contact data found for the provided ID.');
        }
    });
}

function addContact() {
    const contactData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    }

    const validation = validateContact(contactData);
    if (!validation.isValid) {
        displayValidationErrors(validation.errors);
        return;
    }

    contactData.userId = userId;

    sendAjaxRequest('AddContact.php', contactData, function(response) {
        if (response.error) {
            console.error("Error adding contact:", response.error);
            alert("Error: " + response.error);
        } else {
            alert(response.message || "Contact added successfully");
            closeContactPopup();
            loadContacts(); // Refresh the contacts list
        }
    });
}

function editContact() {
    const contactData = {
        ID: contactId,
        UserId: userId,
        FirstName: document.getElementById('firstName').value,
        LastName: document.getElementById('lastName').value,
        Email: document.getElementById('email').value,
        Phone: document.getElementById('phone').value
    };

    console.log("data to edit:", contactData);

    const validation = validateContact(contactData);
    if (!validation.isValid) {
        displayValidationErrors(validation.errors);
        return;
    }

    sendAjaxRequest('EditContact.php', contactData, function(response) {
        if (response.error) {
            alert("Error updating contact: " + response.error);
        } else {
            alert("Contact updated successfully");
            closeContactPopup();
            loadContacts();
        }
    });
}

function validateContact(contactData) {
    let errors = {};
    let isValid = true;

    if (!contactData.FirstName.trim() || !patterns.name.test(contactData.FirstName.trim())) {
        isValid = false;
        errors.firstName = "First name is required and must be valid.";
    }

    if (contactData.LastName.trim() && !patterns.name.test(contactData.LastName.trim())) {
        isValid = false;
        errors.lastName = "Invalid last name.";
    }

    if (contactData.Phone.trim() && !patterns.phone.test(contactData.Phone.trim())) {
        isValid = false;
        errors.phone = "Invalid phone number.";
    }

    if (contactData.Email.trim() && !patterns.email.test(contactData.Email.trim())) {
        isValid = false;
        errors.email = "Invalid email.";
    }

    return { isValid, errors };
}

function resetValidationMessages() {
    ['firstName', 'lastName', 'email', 'phone'].forEach(field => {
        const errorElement = document.getElementById(field + 'Error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    });
}

function displayValidationErrors(errors) {
    resetValidationMessages();

    for (const fieldName in errors) {
        const inputElement = document.querySelector(`input[name="${fieldName}Input"]`);
        if (inputElement) {
            inputElement.classList.add('is-invalid');
            inputElement.classList.remove('is-valid');
            
            const feedbackElement = inputElement.nextElementSibling; 
            if (feedbackElement) {
                feedbackElement.textContent = errors[fieldName];
            }
        } else {
            console.error('Input element not found for field:', fieldName);
        }
    }
}

function resetFormAndState() {
    document.getElementById('contact-form').reset(); 
    resetValidationMessages();
    contactId = null;
}

function loadContacts() {
    let payload = { userId: userId };

    sendAjaxRequest('SearchContact.php', payload, function(response) {
        console.log('Response from loadContacts:', response);
        if (response.error) {
            console.error("Error loading contacts:", response.error);
            alert("Error loading contacts: " + response.error);
        } else {
            displayContacts(response);
        }
    });
}

function displayContacts(contacts) {
    const tableBody = document.getElementById("my-table");
    if (!tableBody) {
        console.error("Table body element not found");
        return;
    }

    tableBody.innerHTML = ''; 

    contacts.forEach(contact => {
        const row = createTableRow(contact);
        tableBody.appendChild(row); 
    });
}

function formatPhoneNumber(phoneNumber) {
    if (phoneNumber === '0') {
        return '';
    }

    const digits = phoneNumber.replace(/\D/g, "");
    if (digits.length === 10) {
        return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    return phoneNumber; 
}

function createTableRow(contact) {
    const row = document.createElement('tr');

    const formattedPhone = contact.Phone ? formatPhoneNumber(contact.Phone) : '';

    row.innerHTML = `
        <td class="text-center">${contact.FirstName || ''}</td>
        <td class="text-center">${contact.LastName || ''}</td>
        <td class="text-center">${contact.Email || ''}</td>
        <td class="text-center">${formattedPhone}</td>
        <td class="text-center action-column">
            <button class="btn btn-info edit-btn" data-id="${contact.ID}"><i class="fas fa-pencil-alt"></i></button>
            <button class="btn btn-danger delete-btn" data-id="${contact.ID}"><i class="fas fa-trash"></i></button>
        </td>
    `;
    
    return row;
}

function fetchAndEditContact() {
    userId = sessionStorage.getItem('userId');
    sendAjaxRequest('SearchContact.php', { search: "", userId  }, function(response) {
        if (response.error) {
            alert(response.error);
        } else {
            const contact = response.find(c => c.ID.toString() === contactId);
            if (contact) {
                document.getElementById('firstName').value = contact.FirstName;
                document.getElementById('lastName').value = contact.LastName;
                document.getElementById('email').value = contact.Email;
                document.getElementById('phone').value = contact.Phone;
                window.contactId = contactId;
                addContactPopup(true); 
            } else {
                console.error("No contact with the specified ID found in response:", response);
            }
        }
    });
}

function deleteContact(contactId) {
    if (confirm('Are you sure you want to delete this contact?')) {
        const userId = sessionStorage.getItem('userId');
        let payload = { userId: userId, ID: contactId };
        console.log(contactId);
        sendAjaxRequest('DeleteContact.php', payload, function(response) {
            if (response.error) {
                alert(response.error);
            } else {
                alert("Contact deleted successfully");
                loadContacts();
            }
        });
    }
}

function searchContacts(query) {
    const userId = sessionStorage.getItem('userId');
    let payload = {
        search: query,
        userId: userId
    };
    sendAjaxRequest('SearchContact.php', payload, function(response) {
        if (response.error) {
            console.error("Error searching contacts:", response.error);
            alert(response.error);
        } else {
            displayContacts(response);
        }
    });
}

function initializeContacts() {
    console.log('Initializing contacts...');
    userId = sessionStorage.getItem('userId');
    if (isNaN(userId) || userId <= 0) {
        window.location.href = "login.html";
        return;
    }

    let payload = {
        search: "", 
        userId: userId
    };

    sendAjaxRequest('SearchContact.php', payload, function (response) {
        console.log("displayContacts response: ", response);
        if (response.error) {
            alert(response.error);
        } else {
            displayContacts(response); 
        }
    });
}

function initializeContactEventListeners() {
    console.log('Initializing contact event listener...');

    const addContactButton = document.getElementById('add-button');
    if (addContactButton) {
        addContactButton.addEventListener('click', function() { setupContactPopup(); });
    } else {
        console.error("Add contact button not found");
    }

    document.getElementById('contact-form').addEventListener('submit', function(event) {
        event.preventDefault();
        if (isEditing) {
            editContact();
        } else {
            addContact();
        }
    });

    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    searchButton.addEventListener('click', function() {
        searchContacts(searchInput.value);
    });
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === "Enter") {
            searchContacts(this.value);
        }
    });

    const contactsTableBody = document.getElementById('my-table');
    contactsTableBody.addEventListener('click', function(event) {
        const target = event.target;
        if (target.closest('.edit-btn')) {
            const contactId = target.closest('.edit-btn').getAttribute('data-id');
            setupContactPopup(contactId);
        } else if (target.closest('.delete-btn')) {
            const contactId = target.closest('.delete-btn').getAttribute('data-id');
            deleteContact(contactId);
        }
    });
}
