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

// sort by column
$('th').on('click', function(){
    var column = $(this).data('colname')
    var order = $(this).data('order')
    var text = $(this).html()
    text = text.substring(0, text.length - 1);
    
    
    
    if (order == 'desc'){
        $(this).data("order","asc");
        myArray = myArray.sort((a, b) => a[column] > b[column] ? 1 : -1)
        text += '&#9660'
    }else{
        $(this).data("order","desc");
        myArray = myArray.sort((a, b) => a[column] < b[column] ? 1 : -1)
        text += '&#9650'
    }

   $(this).html(text)
   buildTable(myArray)
})

buildTable(myArray)

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
                        </td>
                   </tr>`
        table.innerHTML += row
    }
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
function showEditContainer() {
    document.getElementById('edit-container').style.display = 'block';
}

document.getElementById('edit-button').addEventListener('click', showEditContainer);
document.addEventListener('click', function(event) {
if (!event.target.closest('#edit-container')) {
        document.getElementById('edit-container').style.display = 'none';
    }
});
