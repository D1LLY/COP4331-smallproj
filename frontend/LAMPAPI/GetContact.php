<?php
    $inData = getRequestInfo();

    $contactId = $inData["ID"];
    $dbHost = "localhost";
    $dbUser = "TheBeast";
    $dbPass = "@D1llywood";
    $dbName = "COP4331";
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);

    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
    } else {
        $stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email FROM Contacts WHERE ID = ?");
        $stmt->bind_param("i", $contactId);

        if ($stmt->execute()) {
            $result = $stmt->get_result();
            if ($row = $result->fetch_assoc()) {
                returnWithInfo($row['ID'], $row['FirstName'], $row['LastName'], $row['Phone'], $row['Email']);
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

    function returnWithInfo($id, $firstName, $lastName, $phone, $email) {
        $retValue = '{"ID":' . $id . ',"FirstName":"' . $firstName . '","LastName":"' . $lastName . '","Phone":"' . $phone . '","Email":"' . $email . '"}';
        sendResultInfoAsJson($retValue);
    }
?>
