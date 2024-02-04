const urlBase = 'http://cop4331-5.com/LAMPAPI';
const extension = 'php';

// dropdown menu of profile
let subMenu = document.getElementById("subMenu");

    function toggleMenu()
    {
        subMenu.classList.toggle("open-menu");
    }


// contact list
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

// live search
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

// show table data
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
                            <button class="btn btn-sm btn-primar" data-userid="${obj.id}" id="edit-${data.userid}"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="btn btn-sm btn-primar" data-userid="${obj.id}" id="delete-${data.userid}"><i class="fa-solid fa-trash-can"></i></button>

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

document.getElementById("delete-${obj.id}").addEventListener("click", function() {
    var userid = $(this).data('userid')
    
    var deleteBtn = $(`#delete-${obj.id}`);
    var editBtn = $(`#edit-${obj.id}`);
    var cancelBtn = $(`#cancel-${obj.id}`);
    var confirmBtn = $(`#confirm-${obj.id}`);
    
    deleteBtn.addClass('hidden');
    editBtn.hide();
    
    
    cancelBtn.hidden = false;
    document.getElementById(`#edit-${obj.id}`).classList.add = "hidden"
});

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

// show edit container when click "Edit"
// function showEditContainer() {
//     document.getElementById('edit-container').style.display = 'block';
// }

// document.getElementById('edit-button').addEventListener('click', showEditContainer);
// document.addEventListener('click', function(event) {
// if (!event.target.closest('#edit-container')) {
//         document.getElementById('edit-container').style.display = 'none';
//     }
// });
