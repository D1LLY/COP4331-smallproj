<?php
    // Set the content type to application/json for the response
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');

    // Decode the JSON from the request
    $inData = getRequestInfo();

    // Create a connection to the database
    $conn = new mysqli("localhost", "TheBeast", "@D1llywood", "COP4331");

    // Check for a connection error
    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
    } else {
        // Check if the user already exists
        $stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
        $stmt->bind_param("s", $inData["login"]);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // User already exists
            $stmt->close();
            returnWithError("A user with this login already exists.");
        } else {
            // User does not exist, insert new user
            $stmt->close(); // Make sure you close the previous statement.
            $stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES(?,?,?,?)");
            $stmt->bind_param("ssss", $inData["firstName"], $inData["lastName"], $inData["login"], $inData["password"]);
            
            if ($stmt->execute()) {
                // Insert successful
                $last_id = $conn->insert_id;
                $stmt->close();
                returnWithInfo($inData["firstName"], $inData["lastName"], $last_id);
            } else {
                // Insert failed
                $stmt->close();
                returnWithError("Failed to create user.");
            }
        }
        $conn->close(); // Move the close connection command here to make sure it's always called.
    }

    // Functions
    function getRequestInfo() {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj) {
        echo $obj;
    }

    function returnWithError($err) {
        $retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

    function returnWithInfo($firstName, $lastName, $id) {
        $retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
        sendResultInfoAsJson($retValue);
    }
?>
