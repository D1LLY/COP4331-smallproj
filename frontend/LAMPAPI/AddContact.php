<?php
    $inData = getRequestInfo();

    $userId = $inData["userId"];
    $firstName = $inData["firstName"];
    $lastName = $inData["lastName"] ?? 0;
    $phoneNumber = $inData["phoneNumber"] ?? 0;
    $email = $inData["email"] ?? 0;

    $conn = new mysqli("localhost", "TheBeast", "@D1llywood", "COP4331");

    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
    } else {
        $stmt = $conn->prepare("INSERT into Contacts (UserID, FirstName, LastName, Phone, Email) VALUES(?,?,?,?,?)");
        $stmt->bind_param("issss", $userId, $firstName, $lastName, $phoneNumber, $email);

        try {
            if ($stmt->execute()) {
                returnWithSuccess("Contact added successfully");
            } else {
                returnWithError($stmt->error);
            }
        } catch(Exception $e) {
            returnWithError($e->getMessage());
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
