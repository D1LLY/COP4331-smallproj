<?php
    $inData = getRequestInfo();
    $searchQuery = $inData["search"];
    $userId = $inData["userId"]; // Make sure this key is provided in the JSON request
    $dbHost = "localhost";
    $dbUser = "TheBeast";
    $dbPass = "@D1llywood";
    $dbName = "COP4331";
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);

    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
    } else {
        // Add UserID in the WHERE clause to fetch contacts for the logged-in user
        $stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email FROM Contacts WHERE UserID = ? AND (FirstName LIKE ? OR LastName LIKE ?)");
        $searchQuery = "%" . $searchQuery . "%";
        $stmt->bind_param("iss", $userId, $searchQuery, $searchQuery);
        $stmt->execute();
        $result = $stmt->get_result();

        $searchResults = [];
        while ($row = $result->fetch_assoc()) {
            $searchResults[] = $row;
        }

        if (count($searchResults) > 0) {
            returnWithInfo($searchResults);
        } else {
            returnWithError("No contacts found");
        }

        $stmt->close();
        $conn->close();
    }

    function getRequestInfo() {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj) {
        header('Content-type: application/json');
        echo json_encode($obj);
    }

    function returnWithError($err) {
        $retValue = ['error' => $err];
        sendResultInfoAsJson($retValue);
    }

    function returnWithInfo($searchResults) {
        sendResultInfoAsJson($searchResults);
    }
?>
