const urlBase = 'http://cop4331-echo.xyz/';
let userId = 0;
let firstName = '';
let lastName = '';
let isEditing = false; // if true = add

// Validation patterns
const patterns = {
    name: /^[a-zA-Z-']+$/,
    phone: /^[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/,
    email: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
    password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,32}$/
};

// Initialize application
document.addEventListener("DOMContentLoaded", function () {
    // Check if the login form exists on the current page
    if (document.getElementById('loginForm')) {
        setupLoginSignup();
    }

    // Check if there are elements with validation data on the page
    if (document.querySelector('input[data-validation]')) {
        validateOnLoadAndInput();
    }

    // Check if the contact management elements exist on the current page
        // Check if the contact management elements exist on the current page
    if (document.getElementById('contactPopup') || document.getElementById('searchBtn') || 
        document.getElementById('add_new') ||  document.getElementById('cancel-button')) {
        initializeContactEventListeners();
    }
});

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

    sendAjaxRequest('Login.php', "login", payload, (response) => {
        if (response.id > 0) {
            userId = response.id;
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

    sendAjaxRequest('Signup.php', "signup", newUser, (response) => {
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
        default:
            console.error('Unknown validation type:', validationType);
            return;
    }

    // Empty value should always be invalid
    if (value.trim() === '') {
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

// General AJAX request function
function sendAjaxRequest(endpoint, requestType, data, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + 'LAMPAPI/' + endpoint, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE) {
            let response = null;
            try {
                response = JSON.parse(this.responseText);
            } catch (err) {
                console.error("Error parsing response: ", err, this.responseText);
                // Call the callback with a standard error message structure
                callback({ id: 0, success: false, error: "Invalid server response." });
                return;
            }
            callback(response);
        }
    };
    xhr.send(JSON.stringify(data));
}

function saveCookie() {
    const minutes = 20;
    const date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));
    
    document.cookie = `userId=${userId};expires=${date.toGMTString()};path=/;secure;HttpOnly`;
}

// Read the user's session from a cookie
function readCookie() {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.split('=').map(c => c.trim());
        acc[key] = value;
        return acc;
    }, {});

    if (cookies.userId && parseInt(cookies.userId, 10) > 0) {
        appState.userId = parseInt(cookies.userId, 10);
        appState.firstName = cookies.firstName || "";
        appState.lastName = cookies.lastName || "";
        // Proceed with application initialization that requires user info
    } else {
        // Redirect or inform the user they are not logged in
        window.location.href = "login.html";
    }
}

// ----------------------------------------------------
// Contact Manager
// ----------------------------------------------------

// Initialize event listeners for contact management
function initializeContactEventListeners() {
    $(document).ready(function() {
        // Trigger the modal to open
        $('#addContactBtn').click(function () {
            shwCon
        });

        // Handle form submission
        $('#contact-form').submit(function(e) {
            e.preventDefault();

            handleContactSubmit();
            // Close the modal after form submission
            $('#contact-popup').modal('hide');
        });
    });

    const addNewButton = document.getElementById('editInfo');
    if (addNewButton) {
        addNewButton.addEventListener('click', function() {
            showContactPopup(false); // false indicates adding a new contact
        });
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', handleSearchContacts);
    }

    const cancelButton = document.getElementById('cancel-button');
    if (cancelButton) {
        cancelButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor action
            closeContactPopup();
            window.location.href = 'contacts.html'; // Redirect after closing the popup
        });
    }
}

function showContactPopup(editMode,contactId) {
    isEditing = editMode;
    const button = document.getElementById('contactInfoButton');
    button.textContent = isEditing ? 'Edit' : 'Add';
    button.onclick = isEditing ? function() { editContact(contactId); } : addContact;
    document.getElementById('contact-popup').style.display = 'block';
}

function closeContactPopup() {
    var container = document.getElementById('add-container');
    container.style.display = 'none';
}

// Add a new contact
function addContact() {
    const contactData = gatherContactFormData();

    const endpoint = `${urlBase}LAMPAPI/AddContact.php`;
    const jsonPayload = JSON.stringify({
        userId: userId,
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        email: contactData.email,
        phone: contactData.phone
    });

    sendAjaxRequest(endpoint, "addContact", jsonPayload, function(response) {
        if (response.error) {
            alert(response.error);
        } else {
            alert("Contact added successfully");
            // You might want to refresh the contact list or clear the form here
            // e.g., resetFormAndState(); loadContacts();
        }
    }, function(error) {
        alert(`Error adding contact: ${error}`);
    });
}

// Handle the submission of the contact form
function handleContactSubmit(e) {
    e.preventDefault();
    const contactData = gatherContactFormData();
    contactData.id = contactId;
    if (validateContact(contactData)) {
        if (isEditing) {
            editContact(contactData); // if editing
        } else {
            addContact(); // if adding
        }
    } else {
        // Display an error message if validation fails
        alert("Please fill in the form correctly.");
    }
}

function updateFormButton(isEditing) {
    const button = document.getElementById('contact-action-button'); // The ID of your add/edit button
    button.textContent = isEditing ? "Edit" : "Add";
    // You might also want to update the button's event listener here
}

// Gather contact form data
function gatherContactFormData() {
    return {
        firstName: document.querySelector('[name="addFirstName"]').value,
        lastName: document.querySelector('[name="addLastName"]').value,
        email: document.querySelector('[name="addEmail"]').value,
        phone: document.querySelector('[name="addPhone"]').value
    };
}

// Validate the contact data
function validateContact(contactData) {
    return patterns.name.test(contactData.firstName) && 
           patterns.name.test(contactData.lastName) && 
           patterns.phone.test(contactData.phone) && 
           patterns.email.test(contactData.email);
}


// Update an existing contact
function editContact(contactData) {
    const newContactData = gatherContactFormData();
    contactData.id = contactId;
    const endpoint = `${urlBase}/EditContact.${extension}`;
    sendAjaxRequest(endpoint, "editContact", newContactData, "Contact updated successfully", "Error updating contact");
}


// Reset the form and application state
function resetFormAndState() {
    let addForm = document.getElementById("add-form");
    let addButton = document.getElementById("add-button");
    // Check if elements exist before trying to manipulate them
    if (addForm) {
        addForm.reset();
    }
    if (addButton) {
        addButton.textContent = "Add Contact";
    }
    isEditing = false;
    editingContactId = null;
    // Only call hideAddContainer if addContainer exists on this page
    let addContainer = document.getElementById('add-container');
    if (addContainer) {
        hideAddContainer(new Event('click'));
    }
}

// Load all contacts
function loadContacts() {
    // Replace with an AJAX call to get contacts from the server
    const mockContacts = []; // This should be replaced with the data fetched from the server
    displayContacts(mockContacts);
}

// Display the contacts in the UI
function displayContacts(contacts) {
    const tableBody = document.getElementById("myTable");
    tableBody.innerHTML = ''; // Clear existing contacts
    contacts.forEach(contact => {
        tableBody.appendChild(createTableRow(contact));
    });
}

// Create a table row for a contact
function createTableRow(contact) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${contact.firstName}</td>
        <td>${contact.lastName}</td>
        <td>${contact.email}</td>
        <td>${contact.phone}</td>
        <td>
            <button class="btn btn-info edit-btn" data-id="${contact.id}">Edit</button>
            <button class="btn btn-danger delete-btn" data-id="${contact.id}">Delete</button>
        </td>
    `;

    // Add event listeners for edit and delete buttons within the row
    row.querySelector('.editBtn').addEventListener('click', function() {
        editContact(this.dataset.id);
    });
    editButton.addEventListener('click', function() {
        showContactPopup(true, contact.id); // true = edit
    });

    row.querySelector('.deleteBtn').addEventListener('click', function() {
        deleteContact(this.dataset.id);
    });

    return row;
}

// Edit a contact
function editContact(contactId) {
    isEditing = true; // Set this flag to true since we're editing an existing contact
    document.getElementById('contactInfoButton').textContent = 'Edit'; // Set button text to "Edit"
    
    // TODO: Retrieve the contact's information using contactId and populate the form fields

    showContactInfoContainer(); // You might need to change this to show the correct popup
}

// Delete a contact
function deleteContact(contactId) {
    // You would call the server to delete the contact
    // Below is just a mockup console log
    console.log(`Delete contact with ID: ${contactId}`);
    // After deletion, refresh the contact list
    loadContacts();
}

// Show the add-container
function showAddContainer() {
    const addContainer = document.getElementById('add-container');
    if (addContainer.classList.contains('d-none')) {
        addContainer.classList.remove('d-none');
    }
}

// Handle the search input keyup event
function handleSearchContacts() {
    const searchValue = document.getElementById("search-input").value.toLowerCase();
    // Assuming you have a searchContacts function that filters the displayed contacts
    searchContacts(searchValue);
}

// Search for contacts based on the input
function searchContacts(searchValue) {
    // You would typically call the server here to fetch the filtered contacts
    // Below is just a mockup that logs the search value
    console.log(`Search for contacts with value: ${searchValue}`);
    // After fetching the filtered contacts, display them
    const filteredContacts = []; // Replace with actual search results
    displayContacts(filteredContacts);
}

// Call initialization function for contact management
if (document.getElementById('add-form') || 
    document.getElementById('search-input') || 
    document.getElementById('add_new') || 
    document.getElementById('cancel-button')) {
    initializeContactEventListeners();
}
