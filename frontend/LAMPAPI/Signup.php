 <?php
    header('Content-Type: application/json');

    $conn = new mysqli("localhost", "TheBeast", "@D1llywood", "COP4331");
    if ($conn->connect_error) {
        returnWithError($conn->connect_error);
    } else {
        // Check if user already exists
        $stmt = $conn->prepare("SELECT ID FROM Users WHERE Login=?");
        $stmt->bind_param("s", $inData["login"]);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $stmt->close();
            $conn->close();
            returnWithError("A user with this login already exists.");
        } else {
            $stmt->close();
            
            // Insert new user
            $stmt = $conn->prepare("INSERT INTO Users (FirstName, LastName, Login, Password) VALUES(?,?,?,?)");
            $stmt->bind_param("ssss", $inData["firstName"], $inData["lastName"], $inData["login"], $inData["password"]);
            if ($stmt->execute()) {
                $stmt->close();
                $conn->close();
                returnWithInfo($inData["firstName"], $inData["lastName"], $conn->insert_id);
            } else {
                $stmt->close();
                $conn->close();
                returnWithError("Failed to create user.");
            }
        }
    }

    function getRequestInfo() {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj) {
        header('Content-type: application/json');
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
