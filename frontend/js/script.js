const urlBase = 'http://cop4331-echo.xyz/';

let userId = 0;
let firstName = "";
let lastName = "";
const ids = []

document.addEventListener("DOMContentLoaded", function() {
    // ----------------------------------------------------
    // Toggle Buttons
    // ----------------------------------------------------
    
    // Event listeners for the toggle links
    document.getElementById('login-toggle-btn').addEventListener('click', function() {
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('signup-form').style.display = 'none';
        this.classList.add('active');
        document.getElementById('signup-toggle-btn').classList.remove('active');
        this.classList.remove('btn-secondary');
        this.classList.add('btn-primary');
        document.getElementById('signup-toggle-btn').classList.remove('btn-primary');
        document.getElementById('signup-toggle-btn').classList.add('btn-secondary');
    });

    document.getElementById('signup-toggle-btn').addEventListener('click', function() {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
        this.classList.add('active');
        document.getElementById('login-toggle-btn').classList.remove('active');
        this.classList.remove('btn-secondary');
        this.classList.add('btn-primary');
        document.getElementById('login-toggle-btn').classList.remove('btn-primary');
        document.getElementById('login-toggle-btn').classList.add('btn-secondary');
    });

    // Additional script to handle the initial active state
    document.getElementById('login-toggle-btn').classList.add('active');
    document.getElementById('login-toggle-btn').classList.remove('btn-secondary');
    document.getElementById('login-toggle-btn').classList.add('btn-primary');

    // ----------------------------------------------------
    // Form Submission
    // ----------------------------------------------------

    /*
    // Login form submission handler
    document.getElementById('login-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
        doLogin();
    });
    */

    /*
    // Signup form submission handler
    document.getElementById('signup-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission
        doSignup();
    });
    */

    /*
    // Form submission event listener
    document.getElementById('signupButton').addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default form submission

        const isValid = doSignup(); // Assuming doSignup() is a function that validates the whole form
        if (isValid) {
            // If valid, submit the form
            // Ensure the form selector is correct
            document.querySelector('form').submit();
        } else {
            // If not valid, show an error message
            console.log('Validation failed');
        }
    });
    */
});

// ----------------------------------------------------
// Validation Criteria
// ----------------------------------------------------

function validateEmail(email) {
    const criteria = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return {
        isValid: criteria.test(email),
        message: criteria.test(email) ? "Email looks good!" : "Invalid email"
    };
}

function validateName(name) {
    const criteria = /^[a-zA-Z-']+$/;
    return {
        isValid: criteria.test(name),
        message: criteria.test(name) ? "Name looks good!" : "Name is blank or invalid"
    };
}

function validatePassword(password) {
    const criteria = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,32}$/;
    return {
        isValid: criteria.test(password),
        message: criteria.test(password) ? "Password looks good!" : "Password is blank or invalid"
    };
}

// ----------------------------------------------------
// Login
// ----------------------------------------------------

// Email Validation
document.querySelector('[name="loginEmail"]').addEventListener('input', function() {
    const result = validateEmail(this.value);
    const emailValidFeedback = document.getElementById("loginEmailValidFeedback");
    const emailInvalidFeedback = document.getElementById("loginEmailInvalidFeedback");
    if (result.isValid) {
        emailValidFeedback.style.display = 'block';
        emailInvalidFeedback.style.display = 'none';
        emailValidFeedback.textContent = result.message;
    } else {
        emailValidFeedback.style.display = 'none';
        emailInvalidFeedback.style.display = 'block';
        emailInvalidFeedback.textContent = result.message;
    }
});

// Password Validation
document.querySelector('[name="loginPassword"]').addEventListener('input', function() {
    const result = validatePassword(this.value);
    const passwordValidFeedback = document.getElementById("loginPasswordValidFeedback");
    const passwordInvalidFeedback = document.getElementById("loginPasswordInvalidFeedback");
    if (result.isValid) {
        passwordValidFeedback.style.display = 'block';
        passwordInvalidFeedback.style.display = 'none';
        passwordValidFeedback.textContent = result.message;
    } else {
        passwordValidFeedback.style.display = 'none';
        passwordInvalidFeedback.style.display = 'block';
        passwordInvalidFeedback.textContent = result.message;
    }
});

// Log In User
document.getElementById("loginButton").addEventListener("click", e => {
    e.preventDefault();

    // Reset any previous user data
    userId = 0;
    firstName = "";
    lastName = "";

    let email = document.querySelector('[name="loginEmail"]').value;
    let password = document.querySelector('[name="loginPassword"]').value;

    let isFormValid = validateEmail(email).isValid &&
                      validatePassword(password).isValid;
    
    if (!isFormValid) {
        document.getElementById("loginResult").innerHTML = "Invalid email or password.";
    }
    
    document.getElementById("loginResult").innerHTML = "";

    let jsonPayload = JSON.stringify({
        login: email,
        password: password // hash: md5(password) 
    });

    // AJAX request to the login endpoint
    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + 'LAMPAPI/Login.php', true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            console.log("Response Status:", this.status);
            console.log("Response Text:", this.responseText);

            if (this.readyState == 4 && this.status == 200) {
                
                let jsonObject = JSON.parse(xhr.responseText);
                console.log("Parsed JSON:", jsonObject);
                
                userId = jsonObject.id;
                console.log("user id:", userId);
                
                // Prevent default form submission **?
                if (userId < 1) {
                    document.getElementById("loginResult").innerHTML = "Invalid email or password.";
                    return
                        ;
                }
                userId = jsonObject.id;
                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;

                // saveCookie();
                window.location.href = "contacts.html";
            }
        };

        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("loginResult").innerHTML = err.message;
    }
});

function doLogout() {
    userId = 0;
    email = "";
    
	document.cookie = "email= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"; // **?
	window.location.href = "index.html";
}

// ----------------------------------------------------
// Signup
// ----------------------------------------------------

// First Name Validation
document.getElementById("firstName").addEventListener('input', function() {
    const result = validateName(this.value);
    const firstNameValidFeedback = document.getElementById("firstNameValidFeedback");
    const firstNameInvalidFeedback = document.getElementById("firstNameInvalidFeedback");
    if (result.isValid) {
        firstNameValidFeedback.style.display = 'block';
        firstNameInvalidFeedback.style.display = 'none';
        firstNameValidFeedback.textContent = result.message;
    } else {
        firstNameValidFeedback.style.display = 'none';
        firstNameInvalidFeedback.style.display = 'block';
        firstNameInvalidFeedback.textContent = result.message;
    }
});

// Last Name Validation
document.getElementById("lastName").addEventListener('input', function() {
    const result = validateName(this.value);
    const lastNameValidFeedback = document.getElementById("lastNameValidFeedback");
    const lastNameInvalidFeedback = document.getElementById("lastNameInvalidFeedback");
    if (result.isValid) {
        lastNameValidFeedback.style.display = 'block';
        lastNameInvalidFeedback.style.display = 'none';
        lastNameValidFeedback.textContent = result.message;
    } else {
        lastNameValidFeedback.style.display = 'none';
        lastNameInvalidFeedback.style.display = 'block';
        lastNameInvalidFeedback.textContent = result.message;
    }
});

// Email Validation
document.querySelector('[name="signupEmail"]').addEventListener('input', function() {
    const result = validateEmail(this.value);
    const emailValidFeedback = document.getElementById("signupEmailValidFeedback");
    const emailInvalidFeedback = document.getElementById("signupEmailInvalidFeedback");
    if (result.isValid) {
        emailValidFeedback.style.display = 'block';
        emailInvalidFeedback.style.display = 'none';
        emailValidFeedback.textContent = result.message;
    } else {
        emailValidFeedback.style.display = 'none';
        emailInvalidFeedback.style.display = 'block';
        emailInvalidFeedback.textContent = result.message;
    }
});

// Password Validation
document.querySelector('[name="signupPassword"]').addEventListener('input', function() {
    const result = validatePassword(this.value);
    const passwordValidFeedback = document.getElementById("signupPasswordValidFeedback");
    const passwordInvalidFeedback = document.getElementById("signupPasswordInvalidFeedback");
    if (result.isValid) {
        passwordValidFeedback.style.display = 'block';
        passwordInvalidFeedback.style.display = 'none';
        passwordValidFeedback.textContent = result.message;
    } else {
        passwordValidFeedback.style.display = 'none';
        passwordInvalidFeedback.style.display = 'block';
        passwordInvalidFeedback.textContent = result.message;
    }
});

// Sign Up
document.getElementById("signupButton").addEventListener("click", e => {
    e.preventDefault();

    firstName = document.querySelector('[name="signupFirstName"]').value;
    lastName = document.querySelector('[name="signupLastName"]').value;
    const email = document.querySelector('[name="signupEmail"]').value;
    const password = document.querySelector('[name="signupPassword"]').value;

    let isFormValid = validateEmail(email).isValid &&  
                    validatePassword(password).isValid &&
                    validateName(firstName).isValid &&
                    validateName(lastName).isValid;

    if (!isFormValid) {
        document.getElementById("signupResult").innerText = "Invalid signup. Check your details.";
        return;
    }

    document.getElementById("signupResult").innerHTML = "";

    let jsonPayload = JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        login: email, 
        password: password // hash: md5(password)
    });

    let xhr = new XMLHttpRequest();
    xhr.open("POST", urlBase + 'LAMPAPI/Signup.php', true); 
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {

            if (this.readyState == 4) {
                console.log(this.responseText);  // Add this line for debugging
                try {
                    let jsonObject = JSON.parse(this.responseText);
                    // Your existing code here...
                } catch (err) {
                    console.error('Error parsing JSON:', err);
                    console.error('Response received:', this.responseText);
                }
            }
            
            
            if (this.readyState != 4) {
                return;
            }

            if (this.status == 409) {
                document.getElementById("signupResult").innerHTML = "User already exists.";
                return;
            }

            if (this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);
                console.log(jsonObject);
                userId = jsonObject.id;

                if (userId < 1) {
                    document.getElementById("signupResult").innerHTML = "Error signing up.";
                    return;
                }

                document.getElementById("signupResult").innerHTML = "User added!";
                firstName = jsonObject.firstName;
                lastName = jsonObject.lastName;
                saveCookie();
                window.location.href = "contacts.html";
            }
        };

        xhr.send(jsonPayload);
    } catch (err) {
        document.getElementById("signupResult").innerHTML = err.message;
    }
});

// ----------------------------------------------------
// Cookie Management
// ----------------------------------------------------

function saveCookie() {
	let minutes = 20;
	let date = new Date();
    date.setTime(date.getTime() + (minutes * 60 * 1000));	
    
    document.cookie = "email=" + email + ",userId=" + userId + ";expires=" + date.toGMTString();
} // get raw value use field val from doc 

function readCookie() {
    userId = -1;
    let data = document.cookie;
    let splits = data.split(",");

    for (var i = 0; i < splits.length; i++) {

        let thisOne = splits[i].trim();
        let tokens = thisOne.split("=");

        if (tokens[0] == "firstName") {
            firstName = tokens[1];
        }

        else if (tokens[0] == "lastName") {
            lastName = tokens[1];
        }

        else if (tokens[0] == "userId") {
            userId = parseInt(tokens[1].trim());
        }
    }

    if (userId < 0) {
        window.location.href = "index.html"; // *** INDEX.HTML
    }

    else {
        // document.getElementById("signupEmail").innerHTML = "Welcome, " + firstName + " " + lastName + "!";
    }
}

// ----------------------------------------------------
// Contacts Table
// ----------------------------------------------------

// look into this some more
function showTable() {
    var x = document.getElementById("addMe");
    var contacts = document.getElementById("contactsTable")
    if (x.style.display === "none") {
        x.style.display = "block";
        contacts.style.display = "none";
    } else {
        x.style.display = "none";
        contacts.style.display = "block";
    }
}

// ensure elements match html!!
function addContact() {

    let firstName = document.getElementById("FirstName").value;
    let lastName = document.getElementById("LastName").value;
    let phoneNumber = document.getElementById("Phone").value;
    let emailAddress = document.getElementById("Email").value;

    if (!validAddContact(firstName, lastName, phoneNumber, emailAddress)) {
        console.log("INVALID FIRST NAME, LAST NAME, PHONE, OR EMAIL SUBMITTED"); // console
        return;
    }

    let tmp = {
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        emailAddress: emailAddress,
        userId: userId
    };


    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + 'LAMPAPI/AddContacts.php';

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log("Contact added");

                // Clear input fields in form 
                document.getElementById("addMe").reset(); // ***?

                // Reload contacts table, switch view to show
                loadContacts();
                showTable();
            }
        };

        xhr.send(jsonPayload);
    } catch (err) {
        console.log(err.message);
    }
}

function validAddContact(first, last, phone, email) {

    var firstErr = lastErr = phoneErr = emailErr = true;

    if (first == "") {
        console.log("FIRST NAME IS BLANK");
    } else {
        console.log("Valid first name");
        firstErr = false;
    }

    if (last == "") {
        console.log("LAST NAME IS BLANK");
    } else {
        console.log("Valid last name");
        lastErr = false;
    }

    if (phone == "") {
        console.log("PHONE IS BLANK");
    } else {
        var regex = /^[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/;

        if (regex.test(phone) == false) {
            console.log("INVALID PHONE NUMBER");
        } else {
            console.log("Valid phone number");
            phoneErr = false;
        }
    }

    if (email == "") {
        console.log("EMAIL IS BLANK");
    } else {
        var regex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;

        if (regex.test(email) == false) {
            console.log("INVALID EMAIL");
        } else {
            console.log("Valid email");
            emailErr = false;
        }
    }

    if ((phoneErr || emailErr || firstErr || lastErr) == true) {
        return false;
    }

    return true;
}

function loadContacts() {
    let tmp = {
        search: "",
        userId: userId
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/SearchContact.php'; // endpoint?
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true); // **?
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let jsonObject = JSON.parse(xhr.responseText);

                if (jsonObject.error) {
                    console.log(jsonObject.error);
                    return;
                }

                // ENSURE THIS FITS!
                let text = "<table border='1'>"
                for (let i = 0; i < jsonObject.results.length; i++) {
                    ids[i] = jsonObject.results[i].ID
                    text += "<tr id='row" + i + "'>"
                    text += "<td id='first_Name" + i + "'><span>" + jsonObject.results[i].FirstName + "</span></td>";
                    text += "<td id='last_Name" + i + "'><span>" + jsonObject.results[i].LastName + "</span></td>";
                    text += "<td id='email" + i + "'><span>" + jsonObject.results[i].EmailAddress + "</span></td>";
                    text += "<td id='phone" + i + "'><span>" + jsonObject.results[i].PhoneNumber + "</span></td>";
                    text += "<td>" +
                        "<button type='button' id='edit_button" + i + "' class='w3-button w3-circle w3-lime' onclick='edit_row(" + i + ")'>" + "<span class='glyphicon glyphicon-edit'></span>" + "</button>" +
                        "<button type='button' id='save_button" + i + "' value='Save' class='w3-button w3-circle w3-lime' onclick='save_row(" + i + ")' style='display: none'>" + "<span class='glyphicon glyphicon-saved'></span>" + "</button>" +
                        "<button type='button' onclick='delete_row(" + i + ")' class='w3-button w3-circle w3-amber'>" + "<span class='glyphicon glyphicon-trash'></span> " + "</button>" + "</td>";
                    text += "<tr/>"
                }
                text += "</table>"
                document.getElementById("tbody").innerHTML = text;
            }
        };

        xhr.send(jsonPayload);
    } catch (err) {
        console.log(err.message);
    }
}

// LOOK INTO NAMING CONVENTIONS
function edit_row(id) {
    document.getElementById("edit_button" + id).style.display = "none";
    document.getElementById("save_button" + id).style.display = "inline-block";

    var firstNameI = document.getElementById("first_Name" + id);
    var lastNameI = document.getElementById("last_Name" + id);
    var email = document.getElementById("email" + id);
    var phone = document.getElementById("phone" + id);

    var namef_data = firstNameI.innerText;
    var namel_data = lastNameI.innerText;
    var email_data = email.innerText;
    var phone_data = phone.innerText;

    firstNameI.innerHTML = "<input type='text' id='namef_text" + id + "' value='" + namef_data + "'>";
    lastNameI.innerHTML = "<input type='text' id='namel_text" + id + "' value='" + namel_data + "'>";
    email.innerHTML = "<input type='text' id='email_text" + id + "' value='" + email_data + "'>";
    phone.innerHTML = "<input type='text' id='phone_text" + id + "' value='" + phone_data + "'>"
}

function save_row(no) {
    var namef_val = document.getElementById("namef_text" + no).value;
    var namel_val = document.getElementById("namel_text" + no).value;
    var email_val = document.getElementById("email_text" + no).value;
    var phone_val = document.getElementById("phone_text" + no).value;
    var id_val = ids[no]

    document.getElementById("firstName" + no).innerHTML = namef_val;
    document.getElementById("lastName" + no).innerHTML = namel_val;
    document.getElementById("email" + no).innerHTML = email_val;
    document.getElementById("phone" + no).innerHTML = phone_val;

    document.getElementById("edit_button" + no).style.display = "inline-block";
    document.getElementById("save_button" + no).style.display = "none";

    let tmp = {
        phoneNumber: phone_val,
        emailAddress: email_val,
        newFirstName: namef_val,
        newLastName: namel_val,
        id: id_val
    };

    let jsonPayload = JSON.stringify(tmp);

    let url = urlBase + '/UpdateContacts.php';

    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log("Contact has been updated");
                loadContacts();
            }
        };
        xhr.send(jsonPayload);
    } catch (err) {
        console.log(err.message);
    }
}

function delete_row(no) {
    var namef_val = document.getElementById("first_Name" + no).innerText;
    var namel_val = document.getElementById("last_Name" + no).innerText;
    nameOne = namef_val.substring(0, namef_val.length);
    nameTwo = namel_val.substring(0, namel_val.length);
    let check = confirm('Confirm deletion of contact: ' + nameOne + ' ' + nameTwo);
    if (check === true) {
        document.getElementById("row" + no + "").outerHTML = "";
        let tmp = {
            firstName: nameOne,
            lastName: nameTwo,
            userId: userId
        };

        let jsonPayload = JSON.stringify(tmp);

        let url = urlBase + '/DeleteContacts.php';

        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
        try {
            xhr.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {

                    console.log("Contact has been deleted");
                    loadContacts();
                }
            };
            xhr.send(jsonPayload);
        } catch (err) {
            console.log(err.message);
        }

    };

}

function searchContacts() {
    const content = document.getElementById("searchText");
    const selections = content.value.toUpperCase().split(' ');
    const table = document.getElementById("contacts");
    const row = table.getElementsByTagName("row"); // ** CHECK NAMING 

    for (let i = 0; i < tr.length; i++) {
        const td_fn = tr[i].getElementsByTagName("td")[0]; // Table Data: First Name
        const td_ln = tr[i].getElementsByTagName("td")[1]; // Table Data: Last Name

        if (td_fn && td_ln) {
            const txtValue_fn = td_fn.textContent || td_fn.innerText;
            const txtValue_ln = td_ln.textContent || td_ln.innerText;
            tr[i].style.display = "none";

            for (selection of selections) {
                if (txtValue_fn.toUpperCase().indexOf(selection) > -1) {
                    tr[i].style.display = "";
                }

                if (txtValue_ln.toUpperCase().indexOf(selection) > -1) {
                    tr[i].style.display = "";
                }
            }
        }
    }
}

// ----------------------------------------------------
// Color Functionality (seems like example functionality, ensure relevance)
// ----------------------------------------------------
function addColor()
{
	let newColor = document.getElementById("colorText").value;
	document.getElementById("colorAddResult").innerHTML = "";

	let tmp = {color:newColor,userId,userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/AddColor.php';
	
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

	let url = urlBase + '/SearchColors.php';
	
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

// ----------------------------------------------------
// Contacts Page
// ----------------------------------------------------

// Profile dropdown menu
let subMenu = document.getElementById("subMenu");
function toggleMenu()
{
    subMenu.classList.toggle("open-menu");
}

// Contacts list
var myArray = [
    {
        'id' : "1",
        'firstname' : "fiiii",
        'lastname' : "laaaa",
        'email' : "potato@gmail.com",
        'phone' : "124623452",
        'alternative' : "linkedin or socialmedias"
    },
    {
        'id' : "2",
        'firstname' : "shawn",
        'lastname' : "z",
        'email' : "frychicken@gmail.com",
        'phone' : "334576552",
        'alternative' : "linkedin or socialmedias"
    },
    {
        'id' : "3",
        'firstname' : "fiiii",
        'lastname' : "laaaa",
        'email' : "potato@gmail.com",
        'phone' : "999424623452",
        'alternative' : "linkedin or socialmedias"
    },
    {
        'id' : "4",
        'firstname' : "shawn",
        'lastname' : "z",
        'email' : "frychicken@gmail.com",
        'phone' : "34576552",
        'alternative' : "linkedin or socialmedias"
    },
    {
        'id' : "5",
        'firstname' : "fiiii",
        'lastname' : "laaaa",
        'email' : "potato@gmail.com",
        'phone' : "524623452",
        'alternative' : "linkedin or socialmedias"
    },
    {
        'id' : "6",
        'firstname' : "shawn",
        'lastname' : "z",
        'email' : "frychicken@gmail.com",
        'phone' : "934576552",
        'alternative' : "linkedin or socialmedias"
    }
]

// Live search
$('#search-input').on('keyup',function()
{
    var value = $(this).val()
    console.log('Value:',value)
    var data = searchTable(value, myArray)
    buildTable(data)
})

// buildTable(myArray)
for (var i in myArray)
{
    addRow(myArray[i])
}

// Show table data
function buildTable(data)
{
    var table = document.getElementById('myTable')
    table.innerHTML = ''
    for (var i = 0; i < data.length; i++)
    {
        var row = `<tr>
                        <td>${data[i].id}</td>
                        <td>${data[i].firstname}</td>
                        <td>${data[i].lastname}</td>
                        <td>${data[i].email}</td>
                        <td>${data[i].phone}</td>
                        <td>${data[i].alternative}</td>
                        <td>
                            <button><i class="fa-solid fa-pen-to-square"></i></button>
                            <button><i class="fa-solid fa-trash-can"></i></button>

                            <button class="btn btn-sm btn-danger" hidden>Save</button>
                            <button class="btn btn-sm btn-danger" hidden>Cancel</button>
                            <button class="btn btn-sm btn-primar" hidden>Confirm</button>
                        </td>
                   </tr>`
        table.innerHTML += row
    }
}

// Edit table
function addRow(obj)
{
    var row = `<tr scope="row" class="add-${obj.id}">
                        <td>${obj.firstname}</td>
                        <td>${obj.lastname}</td>
                        <td>${obj.email}</td>
                        <td>${obj.phone}</td>   
                        <td>${obj.alternative}</td>
                        <td>
                            <button class="btn btn-sm btn-primar" data-userid="${obj.id}" id="edit-${obj.id}"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="btn btn-sm btn-primar" data-userid="${obj.id}" id="delete-${obj.id}"><i class="fa-solid fa-trash-can"></i></button>

                            <button hidden data-userid="${obj.id}" id="save-${obj.id}">Save</button>
                            <button hidden data-userid="${obj.id}" id="cancel-${obj.id}">Cancel</button>
                            <button hidden data-userid="${obj.id}" id="confirm-${obj.id}">Confirm</button>

                        </td>
	    		   </tr>`
		$('#myTable').append(row);
        // console.log($('delete-{data.userid}'));
        // $(`#delete-${obj.id}`).on('click', deleteRow)
}

function editResult()
{
    var userid = $(this).data(`userid`)
}

function saveUpdate()
{
    var userid = $(this).data(`userid`)
}

/*
document.getElementById("delete-${obj.id}").addEventListener("click", function() {
    var userid = $(this).data('userid')
    
    var deleteBtn = $(`#delete-${obj.id}`);
    var editBtn = $(`#edit-${obj.id}`);
    var cancelBtn = $(`#cancel-${obj.id}`);
    // var confirmBtn = $(`#confirm-${obj.id}`);
    
    deleteBtn.addClass('hidden');
    editBtn.hide();
    
    
    cancelBtn.hidden = false;
    document.getElementById(`#edit-${obj.id}`).classList.add = "hidden"
});
*/

function cancelDeletion()
{
    var userid = $(this).data(`userid`)
}

function confirmDeletion()
{
    var userid = $(this).data(`userid`)
}

// search function
function searchTable(value, data)
{
    var filteredData = []

    for (var i = 0; i < data.length; i++)
    {
        value = value.toLowerCase()
        var id = data[i].id
        var firstname = data[i].firstname.toLowerCase()
        var lastname = data[i].lastname.toLowerCase()
        var email = data[i].email.toLowerCase()
        var phone= data[i].phone
        var alternative = data[i].alternative.toLowerCase()
        
        // if contains the input
        if (id.includes(value) || firstname.includes(value)
        || lastname.includes(value) || email.includes(value)
        || phone.includes(value) ||alternative.includes(value))
        {
            // add the object
            filteredData.push(data[i])
        }
    }
    return filteredData
}
