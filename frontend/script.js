// dropdown menu of profile
let subMenu = document.getElementById("subMenu");

    function toggleMenu(){
        subMenu.classList.toggle("open-menu");
    }

// contact list
var myArray = [
    {
        id : "1",
        name : "fiona",
        email : "potato@gmail.com",
        phone : "324623452",
        alternative : "linkedin or socialmedias"
    },
    {
        id : "2",
        name : "shawn",
        email : "frychicken@gmail.com",
        phone : "334576552",
        alternative : "linkedin or socialmedias"
    }
]

buildTable(myArray)

// show table data
function showtable(curarray) {
    document.getElementById("mytable").innerHTML = `
        <tr class="bg
    `;
}