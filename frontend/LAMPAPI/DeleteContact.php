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
        $stmt = $conn->prepare("DELETE FROM Contacts WHERE ID = ?");
        $stmt->bind_param("i", $contactId);
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            returnWithSuccess("Contact deleted successfully");
        } else {
            returnWithError("No contact found with the given ID");
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

    function returnWithSuccess($msg) {
        $retValue = '{"message":"' . $msg . '"}';
        sendResultInfoAsJson($retValue);
    }
?>
