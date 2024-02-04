# User Registration API Documentation

## Overview

The User Registration API allows users to create a new account by providing their personal information.

## Endpoint: `Newuser.php`

This API endpoint handles user registration and creates a new user account.

**URL:** `http://COP4331-2k24.xyz/LAMPAPI/Newuser.php`

**Method:** `POST`

### Request:

- **Body:**
  - Content-Type: `application/json`
  - Data:
    ```json
    {
      "FirstName": "John",
      "LastName": "Doe",
      "Login": "john_doe",
      "Password": "secretpassword"
    }
    ```

### Response:

- **Success:**
  - Status Code: `200 OK`
  - Content:
    ```json
    {
      "message": "User created successfully."
    }
    ```

- **Failure (All Fields Required):**
  - Status Code: `200 OK`
  - Content:
    ```json
    {
      "error": "All fields are required."
    }
    ```

- **Error (Failed to Create User):**
  - Status Code: `500 Internal Server Error`
  - Content:
    ```json
    {
      "error": "Failed to create user."
    }
    ```

### Sample Usage:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"FirstName":"John","LastName":"Doe","Login":"john_doe","Password":"secretpassword"}' http://COP4331-2k24.xyz/LAMPAPI/Newuser.php
