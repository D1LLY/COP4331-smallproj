const urlBase = 'http://cop4331-echo.xyz/';
let userId = 0;
let firstName = "";
let lastName = "";

// Validation patterns
const patterns = {
    name: /^[a-zA-Z-']+$/,
    phone: /^[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/,
    email: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
    password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,32}$/
};

// Initialize application
document.addEventListener("DOMContentLoaded", function () {
    setupLoginSignup();
    setupValidationListeners();
    // setupAddContactButton();
    // Optionally, readCookie();
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
            alert("Login failed: " + response.error);
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
        alert("All fields must be filled out");
        return;
    }

    sendAjaxRequest('Signup.php', "signup", newUser, (response) => {
        // Assuming the server sets a specific response structure for different outcomes
        if (response.success) {
            alert("Signup successful. Please log in.");
            window.location.href = "login.html";
        } else {
            // Here you would check for specific error messages
            if (response.message === "User already exists") {
                alert("Signup failed: User already exists.");
            } else {
                // For other errors, display the message from the server
                alert("Signup failed: " + response.message);
            }
        }
    });
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

// Setup validation listeners
function setupValidationListeners() {
    document.querySelectorAll('[data-validation]').forEach(input => {
        const validationType = input.getAttribute('data-validation');
        input.addEventListener('input', function() {
            validateField(validationType, input.value, input.id);
        });
    });
}

// Validate individual field
function validateField(validationType, value, inputElementId) {
    let result;
    switch (validationType) {
        case 'email':
            result = validateEmail(value);
            break;
        case 'password':
            result = validatePassword(value);
            break;
        case 'name':
            result = validateName(value);
            break;
        default:
            console.error('Unknown validation type:', validationType);
            return;
    }
    updateValidationFeedback(result, inputElementId);
}

// Update UI based on validation results
function updateValidationFeedback(result, inputElementId) {
    const inputElement = document.getElementById(inputElementId);
    if (result.isValid) {
        inputElement.classList.add('is-valid');
        inputElement.classList.remove('is-invalid');
    } else {
        inputElement.classList.add('is-invalid');
        inputElement.classList.remove('is-valid');
    }
}

// Validation functions
function validateEmail(email) {
    return {
        isValid: patterns.email.test(email),
        message: patterns.email.test(email) ? "Email looks good!" : "Invalid email"
    };
}

function validateName(name) {
    return {
        isValid: patterns.name.test(name),
        message: patterns.name.test(name) ? "Name looks good!" : "Name is blank or invalid"
    };
}

function validatePassword(password) {
    return {
        isValid: patterns.password.test(password),
        message: patterns.password.test(password) ? "Password looks good!" : "Password is blank or invalid"
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
    xhr.onreadystatechange = function() {
        if (this.readyState === XMLHttpRequest.DONE) {
            let response = null;
            try {
                response = JSON.parse(this.responseText);
            } catch (err) {
                console.error("Error parsing response: ", err);
                response = null;
            }

            // Now we check the requestType to decide what to do with the response
            if (this.status === 200 && response) {
                if (requestType === "signup" && response.success) {
                    // For signup, we might want to do something specific like redirecting
                    callback(response);
                } else if (requestType === "login" && response.id) {
                    // For login, we might want to handle the response differently
                    callback(response);
                } else {
                    // Handle other requestTypes or generic success
                    callback(response);
                }
            } else {
                // Handle non-200 responses or when response is undefined
                let errorMessage = response ? response.error : "No response from server";
                callback({ success: false, message: errorMessage, requestType: requestType });
            }
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
    if (document.getElementById('add-form')) {
        document.getElementById('add-form').addEventListener('submit', handleContactSubmit);
    }
    if (document.getElementById('search-input')) {
        document.getElementById('search-input').addEventListener('keyup', handleSearchContacts);
    }
    if (document.getElementById('add_new')) {
        document.getElementById('add_new').addEventListener('click', showAddContactPopup);
    }
    if (document.getElementById('cancel-button')) {
        document.getElementById('cancel-button').addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor action
            closeAddContactPopup();
            window.location.href = 'contacts.html'; // Redirect after closing the popup
        });
    }
}

function toggleAddContainer() {
    console.log('toggleAddContainer function called'); // Check if this message appears in the console
    const addContainer = document.getElementById('add-container');
    if (addContainer) {
        if (addContainer.style.display === 'none' || addContainer.style.display === '') {
            addContainer.style.display = 'block';
        } else {
            addContainer.style.display = 'none';
        }
    } else {
        console.error('add-container element not found');
    }
}

function showAddContactPopup() {
    var container = document.getElementById('add-container');
    container.style.display = 'block';
}

function closeAddContactPopup() {
    var container = document.getElementById('add-container');
    container.style.display = 'none';
}

// Add a new contact
function addContact(contactData) {
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
    if (validateContact(contactData)) {
        if (appState.isEditing) {
            updateContact(contactData);
        } else {
            addContact(contactData);
        }
    } else {
        alert("Please fill in the form correctly.");
    }
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
function updateContact(contactData) {
    contactData.id = appState.editingContactId;
    const endpoint = `${urlBase}/EditContact.${extension}`;
    sendAjaxRequest(endpoint, "editContact", contactData, "Contact updated successfully", "Error updating contact");
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
    row.querySelector('.edit-btn').addEventListener('click', function() {
        editContact(this.dataset.id);
    });
    row.querySelector('.delete-btn').addEventListener('click', function() {
        deleteContact(this.dataset.id);
    });

    return row;
}

// Edit a contact
function editContact(contactId) {
    // Here you would retrieve the contact's information and fill it in the form
    // For now, it is just logging and setting the app state
    console.log(`Edit contact with ID: ${contactId}`);
    appState.isEditing = true;
    appState.editingContactId = contactId;
    // Show the edit form and populate it with contact data
    showAddContainer();
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

// ----------------------------------------------------
// Colors
// ----------------------------------------------------

function addColor()
{
	let newColor = document.getElementById("colorText").value;
	document.getElementById("colorAddResult").innerHTML = "";

	let tmp = {color:newColor,userId,userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + 'LAMPAPI/AddColor.php';
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("colorAddResult").innerHTML = "Color has been added";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorAddResult").innerHTML = err.message;
	}
}

function searchColor()
{
	let srch = document.getElementById("searchText").value;
	document.getElementById("colorSearchResult").innerHTML = "";
	
	let colorList = "";

	let tmp = {search:srch,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + 'LAMPAPI/SearchColors.php';
	
	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				document.getElementById("colorSearchResult").innerHTML = "Color(s) has been retrieved";
				let jsonObject = JSON.parse( xhr.responseText );
				
				for( let i=0; i<jsonObject.results.length; i++ )
				{
					colorList += jsonObject.results[i];
					if( i < jsonObject.results.length - 1 )
					{
						colorList += "<br />\r\n";
					}
				}
				
				document.getElementsByTagName("p")[0].innerHTML = colorList;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("colorSearchResult").innerHTML = err.message;
	}
}
