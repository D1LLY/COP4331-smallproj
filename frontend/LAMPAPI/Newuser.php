<?php
    header('Content-Type: application/json');

    // Function to get JSON data from the request
    function getRequestInfo() {
        return json_decode(file_get_contents('php://input'), true);
    }

    // Function to send JSON response
    function sendResultInfoAsJson($obj) {
        echo json_encode($obj);
    }

    // Function to handle errors and return JSON response
    function returnWithError($err) {
        $retValue = array('error' => $err);
        sendResultInfoAsJson($retValue);
        exit();
    }

    // Function to establish a database connection
    function connectToDatabase() {
        $conn = new mysqli("localhost", "TheBeast", "@D1llywood", "COP4331");
        if ($conn->connect_error) {
            returnWithError("Connection failed: " . $conn->connect_error);
        }
        return $conn;
    }

    // Function to create a new user
    function createUser($firstName, $lastName, $login, $password) {
        $conn = connectToDatabase();

        $stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $firstName, $lastName, $login, $password);

        if ($stmt->execute()) {
            $stmt->close();
            $conn->close();
            return true;
        } else {
            $stmt->close();
            $conn->close();
            return false;
        }
    }

    // Main code
    $data = getRequestInfo();

    $firstName = $data['FirstName'];
    $lastName = $data['LastName'];
    $login = $data['Login'];
    $password = $data['Password'];

    if (empty($firstName) || empty($lastName) || empty($login) || empty($password)) {
        returnWithError("All fields are required.");
    }

    if (createUser($firstName, $lastName, $login, $password)) {
        $response = array('message' => 'User created successfully.');
        sendResultInfoAsJson($response);
    } else {
        returnWithError("Failed to create user.");
    }
?>
