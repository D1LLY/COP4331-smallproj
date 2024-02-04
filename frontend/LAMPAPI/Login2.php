<?php
	$inData = getRequestInfo();
	ECHO "1";

	$id = 0;
	$FirstName = "";
	$LastName = "";

	$conn = new mysqli("localhost", "TheBeast", "@D1llywood", "COP4331"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		ECHO "2";
		$stmt = $conn->prepare("SELECT ID,FirstName,LastName FROM Users WHERE Login=? AND Password =?");
		$stmt->bind_param("ss", $inData["Login"], $inData["Password"]);
		$stmt->execute();
		$result = $stmt->get_result();

		if( $row = $result->fetch_assoc()  )
		{
			returnWithInfo( $row['FirstName'], $row['LastName'], $row['ID'] );
		}
		else
		{
			returnWithError("No Records Found");
		}

		$stmt->close();
		$conn->close();
	}
	
	Function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	Function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	Function returnWithError( $err )
	{
		$retValue = '{"id":0,"FirstName":"","LastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	Function returnWithInfo( $FirstName, $LastName, $id )
	{
		$retValue = '{"id":' . $id . ',"FirstName":"' . $FirstName . '","LastName":"' . $LastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>
