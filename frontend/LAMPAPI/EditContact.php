<?php

$inData = getRequestInfo();

// Using 'ID' as the unique identifier for the contact
$id = $inData["ID"];
$userId = $inData["UserId"]; // To ensure that the contact belongs to the right user

// New contact information
$firstName = $inData["FirstName"];
$lastName = $inData["LastName"];
$phone = $inData["Phone"];
$email = $inData["Email"];

// Database credentials
$dbHost = "localhost";
$dbUser = "TheBeast";
$dbPass = "@D1llywood";
$dbName = "COP4331";

$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);

// Check connection
if ($conn->connect_error) {
    // Connection failed, return error message
    returnWithError($conn->connect_error);
} else {
    // Prepare SQL statement to update contact
    $stmt = $conn->prepare("UPDATE Contacts SET FirstName = ?, LastName = ?, Phone = ?, Email = ? WHERE ID = ? AND UserId = ?");
    $stmt->bind_param("ssssii", $firstName, $lastName, $phone, $email, $id, $userId);

    if ($stmt->execute()) {
        // Contact updated successfully, return success message
        returnWithSuccess("Contact updated successfully");
    } else {
        // SQL execution failed, return error message
        returnWithError("Failed to update contact: " . $stmt->error);
    }

    $stmt->close();
    $conn->close();
}

function getRequestInfo() {
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj) {
    header('Content-type: application/json');
    echo $obj;
}

function returnWithError($err) {
    // Function to return error messages
    $retValue = '{"error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
}

function returnWithSuccess($msg) {
    // Function to return success messages
    $retValue = '{"message":"' . $msg . '"}';
    sendResultInfoAsJson($retValue);
}

?>
