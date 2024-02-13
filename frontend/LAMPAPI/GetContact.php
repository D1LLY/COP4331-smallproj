<?php
    $inData = getRequestInfo();

    // Assuming the contact ID is provided in the request
    $contactId = $inData["ID"];

    // Database credentials
    $dbHost = "localhost";
    $dbUser = "TheBeast"; // Replace with your actual database username
    $dbPass = "@D1llywood"; // Replace with your actual database password
    $dbName = "COP4331"; // Replace with your actual database name

    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);

    // Check connection
    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
    } else {
        // Prepare SQL statement to select contact
        $stmt = $conn->prepare("SELECT FirstName, LastName, Phone, Email FROM Contacts WHERE ID = ?");
        $stmt->bind_param("i", $contactId);

        // Execute the query
        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($row = $result->fetch_assoc()) {
                returnWithInfo($row['FirstName'], $row['LastName'], $row['Phone'], $row['Email']);
            } else {
                returnWithError("No contact found with the provided ID");
            }
        } else {
            returnWithError($stmt->error);
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
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

    function returnWithInfo($firstName, $lastName, $phone, $email) {
        $retValue = '{"FirstName":"' . $firstName . '","LastName":"' . $lastName . '","Phone":"' . $phone . '","Email":"' . $email . '"}';
        sendResultInfoAsJson($retValue);
    }
?>
