# User Login API Documentation

## Endpoint: `Login2.php`

This API allows users to authenticate by providing their login credentials.

**URL:** `http://COP4331-2k24.xyz/LAMPAPI/Login2.php`

**Method:** `POST`

### Request:

- **Body:**
  - Content-Type: `application/json`
  - Data:
    ```json
    {
      "Login": "RickL",
      "Password": "COP4331"
    }
    ```

### Response:

- **Success:**
  - Status Code: `200 OK`
  - Content:
    ```json
    {
      "id": 1,
      "FirstName": "Richard",
      "LastName": "Leinecker",
      "error": ""
    }
    ```

- **Failure:**
  - Status Code: `200 OK`
  - Content:
    ```json
    {
      "id": 0,
      "FirstName": "",
      "LastName": "",
      "error": "No Records Found"
    }
    ```

- **Error:**
  - Status Code: `500 Internal Server Error`
  - Content:
    ```json
    {
      "id": 0,
      "FirstName": "",
      "LastName": "",
      "error": "Connection failed"
    }
    ```

### Sample Usage:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"Login":"RickL","Password":"COP4331"}' http://COP4331-2k24.xyz/LAMPAPI/Login2.php
