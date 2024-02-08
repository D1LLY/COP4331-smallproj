const urlBase = 'http://cop4331-echo.xyz/';
userId = parseInt(sessionStorage.getItem('userId'), 10) || 0;
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
    // Check if the user is logged in
    if (!userId || userId <= 0) {
        window.location.href = "login.html";
        return;
    }

    // Check if the login form exists on the current page
    if (document.getElementById('loginForm')) {
        setupLoginSignup();
    }

    // Check if there are elements with validation data on the page
    if (document.querySelector('input[data-validation]')) {
        validateOnLoadAndInput();
    }

    // Check if the contact management elements exist on the current page
    if (document.getElementById('contact-popup') || document.getElementById('search-button')) {
        initializeContactEventListeners();
        initializeContacts(); // Load initial contact list
    }
});

// Call setupUserId when the document is loaded
document.addEventListener("DOMContentLoaded", setupUserId);

// ----------------------------------------------------
// Login / Signup
// ----------------------------------------------------

// Setup form listeners
function setupLoginSignup() {
    setupToggleButtons();
    // Login & Signup
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

    // Ensure that all fields are filled
    if (!newUser.firstName || !newUser.lastName || !newUser.login || !newUser.password) {
        displaySignupResult("All fields must be filled out");
        return;
    }

    sendAjaxRequest('Signup.php', newUser, (response) => {
        // Replace `signupResultElement` with `signupResult` which is correctly defined above
        const signupResult = document.getElementById('signupResult');
        if (response.id > 0) {
            displaySignupResult("Signup successful :)", true);
        } else {
            displaySignupResult(response.error || "Signup failed :(", false);
        }
    });
}

function displaySignupResult(message, isSuccess) {
    const signupResult = document.getElementById('signupResult'); // Make sure this ID matches your HTML element
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
    return JSON.stringify({ firstName, lastName, login: email, password: password }); // Adapt as needed
}

// Handle authentication response
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

// Setup toggle buttons
function setupToggleButtons() {
    const loginBtn = document.getElementById('login-toggle-btn');
    const signupBtn = document.getElementById('signup-toggle-btn');

    loginBtn.addEventListener('click', function() {
        toggleFormVisibility('login');
    });

    signupBtn.addEventListener('click', function() {
        toggleFormVisibility('signup');
    });

    // Set login as the default active form
    toggleFormVisibility('login');
}

// Toggle form visibility
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
    } else { // 'signup'
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

// Call this function on page load and when the input event is triggered
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
    const validationResult = validateField(validationType, input.value, input.name); // Use name instead of id
    updateValidationFeedback(validationResult, input.name); // Use name instead of id
}

// Update UI based on validation results using name to find the input element
function updateValidationFeedback(result, inputElementName) {
    // Select the input element by its name attribute
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
        // Optionally, if you want to show the validation message
        const feedbackElement = inputElement.nextElementSibling; // Assuming the feedback element is the next sibling
        if (feedbackElement) {
            feedbackElement.textContent = result.message;
        }
    }
}

// Validate individual field
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
            // Here we accept either an empty string or a valid phone pattern
            result.isValid = value.trim() === '' || patterns.phone.test(value);
            result.message = result.isValid ? 'Phone number looks good!' : 'Invalid phone number';
            break;
        default:
            console.error('Unknown validation type:', validationType);
            break;
    }

    // Empty value should be valid for optional fields like phone
    if (value.trim() === '' && validationType !== 'phone') {
        result.isValid = false;
        result.message = 'This field is required';
    }
    return result;
}

// Validation functions
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

function setupUserId() {
    // Try to retrieve the user ID from sessionStorage
    const savedUserId = sessionStorage.getItem('userId');
    if (savedUserId) {
        userId = parseInt(savedUserId, 10);
    } else {
        // If there is no user ID in sessionStorage, redirect to login
        window.location.href = "login.html";
    }
}

// General AJAX request function
function sendAjaxRequest(endpoint, data, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + endpoint, true);
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

// Show the custom contact popup
function showContactPopup() {
    isEditing = false;
    contactId = null; // Reset contactId since we're adding a new contact
    document.getElementById('contact-info-button').textContent = 'Add';
    document.getElementById('contact-popup').style.display = 'flex';
    document.getElementById('contact-form').reset(); // Reset form to clear any existing data
    resetValidationMessages(); // Clear any validation messages
}

// Close the custom contact popup
function closeContactPopup() {
    document.getElementById('contact-popup').style.display = 'none'; // Hide the popup
}

// Add a new contact
function addContact() {
    const contactData = gatherContactFormData();
    console.log("Contact Data to be added:", contactData);
    const validation = validateContact(contactData);

    if (!validation.isValid) {
        displayValidationErrors(validation.errors);
        return;
    }

    console.log("Sending AJAX request to add contact");
    sendAjaxRequest('AddContact.php', contactData, function(response) {
        if (response.error) {
            console.error("Error adding contact:", response.error);
            alert("Error: " + response.error);
        } else {
            alert(response.message || "Contact added successfully");
            closeContactPopup();
            loadContacts();
        }
    });
}

// Handle the submission of the contact form
function handleContactSubmit() {
    if (isEditing) {
        editContact();
    } else {
        addContact();
    }
}


// Gather contact form data
function gatherContactFormData() {
    return {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value
    };
}

// Validate the contact data
function validateContact(contactData) {
    let errors = {};
    let isValid = true;

    // First name is required and must be valid
    if (!contactData.firstName.trim() || !patterns.name.test(contactData.firstName.trim())) {
        isValid = false;
        errors.firstName = "First name is required and must be valid.";
    }

    // Last name is optional, but if provided it must be valid
    if (contactData.lastName.trim() && !patterns.name.test(contactData.lastName.trim())) {
        isValid = false;
        errors.lastName = "Invalid last name.";
    }

    // Phone is optional, but if provided it must be valid
    if (contactData.phone.trim() && !patterns.phone.test(contactData.phone.trim())) {
        isValid = false;
        errors.phone = "Invalid phone number.";
    }

    // Email is optional, but if provided it must be valid
    if (contactData.email.trim() && !patterns.email.test(contactData.email.trim())) {
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
    for (const field in errors) {
        const errorElementId = field + 'Error';
        const errorElement = document.getElementById(errorElementId);
        errorElement.textContent = errors[field];
        errorElement.style.display = 'block';
    }
}

// Update an existing contact
function editContact() {
    const userId = parseInt(sessionStorage.getItem('userId'), 10);
    const contactData = gatherContactFormData();
    contactData.userId = userId;

    const validation = validateContact(contactData);
    if (!validation.isValid) {
        displayValidationErrors(validation.errors);
        return;
    }

    sendAjaxRequest('EditContact.php', contactData, function(response) {
        if (response.error) {
            alert(response.error);
        } else {
            alert("Contact updated successfully");
            closeContactPopup();
            loadContacts();
        }
    });
}


// Reset the form and application state
function resetFormAndState() {
    document.getElementById('contact-form').reset(); // Reset the form
    resetValidationMessages();
    isEditing = false;
    contactId = null;
}


// Load all contacts
function loadContacts() {
    userId = parseInt(sessionStorage.getItem('userId'), 10); // Ensure the userId is up-to-date
    let payload = { userId: userId };

    sendAjaxRequest('SearchContact.php', payload, function(response) {
        if (response.error) {
            console.error("Error loading contacts:", response.error);
            alert("Error loading contacts: " + response.error);
        } else {
            displayContacts(response);
        }
    });
}

// Display the contacts in the UI
function displayContacts(contacts) {
    const tableBody = document.getElementById("my-table");
    if (!tableBody) {
        console.error("Table body element not found");
        return;
    }

    tableBody.innerHTML = ''; // Clear existing contacts

    // Display each contact in the table
    contacts.forEach(contact => {
        const row = createTableRow(contact);
        tableBody.appendChild(row);
    });
}

function formatPhoneNumber(phoneNumber) {
    // Strip all non-digits
    const digits = phoneNumber.replace(/\D/g, "");
    // Check if the input is of correct length
    if (digits.length === 10) {
        return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    return phoneNumber; // return the original string if it's not 10 digits
}

// Create a table row for a contact
function createTableRow(contact) {
    const row = document.createElement('tr');

    // Format phone number if available
    const formattedPhone = contact.phone ? formatPhoneNumber(contact.phone) : '';

    // Construct the HTML for the row
    row.innerHTML = `
        <td>${contact.firstName || ''}</td>
        <td>${contact.lastName || ''}</td>
        <td>${contact.email || ''}</td>
        <td>${formattedPhone}</td>
        <td>
            <button class="btn btn-info edit-btn" data-id="${contact.id}"><i class="fas fa-pencil-alt"></i></button>
            <button class="btn btn-danger delete-btn" data-id="${contact.id}"><i class="fas fa-trash"></i></button>
        </td>
    `;

    // Add event listeners to the edit and delete buttons
    row.querySelector('.edit-btn').addEventListener('click', function() {
        fetchAndEditContact(this.dataset.id);
    });

    row.querySelector('.delete-btn').addEventListener('click', function() {
        if (confirm('Are you sure you want to delete this contact?')) {
            deleteContact(this.dataset.id);
        }
    });

    return row;
}

// Fetch the contact's details and open the edit modal
function fetchAndEditContact(contactId) {
    sendAjaxRequest('SearchContact.php', { userId: userId, contactId: contactId }, function(response) {
        if (response.error) {
            alert(response.error);
        } else {
            const contact = response.contact;
            document.getElementById('firstName').value = contact.firstName;
            document.getElementById('lastName').value = contact.lastName;
            document.getElementById('email').value = contact.email;
            document.getElementById('phone').value = contact.phone;
            // Store the current contact ID globally
            window.contactId = contactId;
        }
    });
    showContactPopup(true);
}

// Delete a contact
function deleteContact(contactId) {
    if (confirm('Are you sure you want to delete this contact?')) {
        const userId = parseInt(sessionStorage.getItem('userId'), 10);
        let payload = { userId: userId, contactId: contactId };
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

// Search for contacts based on the input
function searchContacts(query) {
    const userId = parseInt(sessionStorage.getItem('userId'), 10);
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

// Assuming you have some function to initialize the full list of contacts
function initializeContacts() {
    userId = parseInt(sessionStorage.getItem('userId'), 10);
    if (isNaN(userId) || userId <= 0) {
        // Redirect to login page or show an error message
        window.location.href = "login.html";
        return;
    }

    // Adjust the payload to match SearchContact API's expectations
    let payload = {
        search: "", // Assuming an empty search returns all contacts
        userId: userId // Assuming your API requires a userId to fetch contacts for that user
    };

    // Use the adjusted endpoint for the SearchContact API
    sendAjaxRequest('SearchContact.php', payload, function(response) {
        if (response.error) {
            alert(response.error);
        } else {
            // Assuming the API returns an array of contacts directly
            // Adjust based on your actual API response structure
            // The example assumes the API does not use a 'contacts' key but returns the array directly
            displayContacts(response); 
        }
    });
}


function initializeContactEventListeners() {
    // Event listener for the "Add Contact" button
    const addContactButton = document.getElementById('add-button');
    if (addContactButton) {
        console.log("Add contact button found");
        addContactButton.addEventListener('click', showContactPopup);
    } else {
        console.error("Add contact button not found");
    }

    // Event listener for the contact form submission
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission
        handleContactSubmit();
    });

    // Event listeners for search
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

    // Delegated event handling for dynamic edit and delete buttons
    const contactsTableBody = document.getElementById('my-table');
    contactsTableBody.addEventListener('click', function(event) {
        const target = event.target;
        if (target.closest('.edit-btn')) {
            const contactId = target.closest('.edit-btn').getAttribute('data-id');
            showContactPopup(true, contactId);
        } else if (target.closest('.delete-btn')) {
            const contactId = target.closest('.delete-btn').getAttribute('data-id');
            deleteContact(contactId);
        }
    });
}
