
# API Documentation

Commit hash: testcommithash

## Content

- [v1 - POST Testendpoint for multiple purposes /v/1/endpoint/:id](#v1-testendpoint-for-multiple-purposes)
- [v1 - POST Faulty Testendpoint /v/1/faultyendpoint/:id](#v1-faulty-testendpoint)
- [v1 - POST Typeless endpoint /v/1/typelessendpoint](#v1-typeless-endpoint)
- [v1 - POST OneOf endpoint /v/1/cantdecide](#v1-oneof-endpoint)
- [v1 - DELETE Endpoint with Pw Authentication /v/1/withpw](#v1-endpoint-with-pw-authentication)
- [v1 - PATCH Endpoint with Token Authentication /v/1/withtoken](#v1-endpoint-with-token-authentication)
- [v1 - PUT Endpoint with JWT Authentication /v/1/withjwt](#v1-endpoint-with-jwt-authentication)
- [v1 - GET Error checkpoint endpoint /v/1/error](#v1-error-checkpoint-endpoint)
## Endpoints


### v1 Testendpoint for multiple purposes

Behaves radically different, based on what
 the filter is.

**Method:** `POST`

**Path:** `/v/1/endpoint/:id`

- **Body:**
  - name:
    ```
    <string> (= "no name")
    ```

- **Query:**
  - filter:
    ```
    ? <string>
    ```
  - number:
    ```
    <int> (= 0)
    ```

- **Params:**
  - id:
    ```
    <id>
    ```

- **Returns:**
  - Status: 200
    ```
    "ok"
    ```
  - Status: 400
    ```
    { "error": "Name too long" }
    ```
  - Status: 200
    ```
    {
      "foo": "really!",
      "boo": <bool>,
      "kabaz": ? <bool>,
      "arr": [
        {
          "a": <int>,
          "c": ? {
            "d": <int>
          },
          "e": ? <int>
        }
      ],
      "objectWithUnknownKeys": {
        </>: <int>
      },
      "objectWithUnknownKeysAndUnknownTypes": {
        </>: </>
      }
    }
    ```
  - Status: 400
    ```
    { "error": "Fieldmissmatch" }
    ```
- **Usage:**
```js
try {
  const response = await post("endpoint/$1", [ id ])
    .query({ filter, number })
    .data({ name })
    .on({ status: 400, error: "Name too long" }, () => {
       /* handle error */
    });
} catch (e) {
  // If e is not false, then no error-catcher caught the error and
  // you might want to take care of it
  e && alert(e);
}
```
### v1 Faulty Testendpoint

Ment to be found to be faulty. It's documentation
does not match it's behavior.

**Method:** `POST`

**Path:** `/v/1/faultyendpoint/:id`

- **Body:**
  - name:
    ```
    <string> (= "no name")
    ```

- **Query:**
  - filter:
    ```
    ? <string>
    ```

- **Params:**
  - id:
    ```
    <id>
    ```

- **Returns:**
  - Status: 200
    ```
    "ok"
    ```
  - Status: 400
    ```
    { "error": "Name too long" }
    ```
  - Status: 200
    ```
    {
      "boo": <bool>,
      "arr": [
        {
          "a": <int>
        }
      ]
    }
    ```
  - Status: 400
    ```
    { "error": "Fieldmissmatch" }
    ```
- **Usage:**
```js
try {
  const response = await post("faultyendpoint/$1", [ id ])
    .query({ filter })
    .data({ name })
    .on({ status: 400, error: "Name too long" }, () => {
       /* handle error */
    });
} catch (e) {
  // If e is not false, then no error-catcher caught the error and
  // you might want to take care of it
  e && alert(e);
}
```
### v1 Typeless endpoint

This endpoint is typeless but not pointless.

**Method:** `POST`

**Path:** `/v/1/typelessendpoint`

- **Returns:**
  - Status: 400
    ```
    { "error": "Fieldmissmatch" }
    ```
- **Usage:**
```js
try {
  const response = await post("typelessendpoint", [  ]);
} catch (e) {
  // If e is not false, then no error-catcher caught the error and
  // you might want to take care of it
  e && alert(e);
}
```
### v1 OneOf endpoint

This endpoint can't decide what it wants.

**Method:** `POST`

**Path:** `/v/1/cantdecide`

- **Body:**
  - value:
    ```
    (
      <int>
      | {
        </>: </>
      }
    )
    ```

- **Returns:**
  - Status: 400
    ```
    { "error": "Fieldmissmatch" }
    ```
- **Usage:**
```js
try {
  const response = await post("cantdecide", [  ])
    .data({ value });
} catch (e) {
  // If e is not false, then no error-catcher caught the error and
  // you might want to take care of it
  e && alert(e);
}
```
### v1 Endpoint with Pw Authentication

You shall not pass, unless you have a password.

**Method:** `DELETE`

**Path:** `/v/1/withpw`

- **Header:**
  - Authorization: Basic btoa(uname:password)
        
- **Returns:**
  - Status: 401
    ```
    { "error": "User not found" }
    ```
  - Status: 400
    ```
    { "error": "Authorization wrong" }
    ```
  - Status: 400
    ```
    { "error": "Fieldmissmatch" }
    ```
- **Usage:**
```js
try {
  const response = await delete("withpw", [  ])
    .auth(user)
    .on({ status: 401, error: "User not found" }, () => {
       /* handle error */
    })
    .on({ status: 400, error: "Authorization wrong" }, () => {
       /* handle error */
    });
} catch (e) {
  // If e is not false, then no error-catcher caught the error and
  // you might want to take care of it
  e && alert(e);
}
```
### v1 Endpoint with Token Authentication

You shall not pass, unless you have a token.

**Method:** `PATCH`

**Path:** `/v/1/withtoken`

- **Header:**
  - Authorization: Basic btoa(uname:token)
        
- **Returns:**
  - Status: 401
    ```
    { "error": "User not found" }
    ```
  - Status: 400
    ```
    { "error": "Authorization wrong" }
    ```
  - Status: 400
    ```
    { "error": "Fieldmissmatch" }
    ```
- **Usage:**
```js
try {
  const response = await patch("withtoken", [  ])
    .auth(user)
    .on({ status: 401, error: "User not found" }, () => {
       /* handle error */
    })
    .on({ status: 400, error: "Authorization wrong" }, () => {
       /* handle error */
    });
} catch (e) {
  // If e is not false, then no error-catcher caught the error and
  // you might want to take care of it
  e && alert(e);
}
```
### v1 Endpoint with JWT Authentication

You shall not pass, unless you have a JWT.

**Method:** `PUT`

**Path:** `/v/1/withjwt`

- **Header:**
  - Authorization: Bearer jwt
        
- **Returns:**
  - Status: 401
    ```
    { "error": "Unauthorized" }
    ```
  - Status: 401
    ```
    { "error": "Token invalid" }
    ```
  - Status: 400
    ```
    { "error": "Fieldmissmatch" }
    ```
- **Usage:**
```js
try {
  const response = await put("withjwt", [  ])
    .auth(user)
    .on({ status: 401, error: "Unauthorized" }, () => {
       /* handle error */
    })
    .on({ status: 401, error: "Token invalid" }, () => {
       /* handle error */
    });
} catch (e) {
  // If e is not false, then no error-catcher caught the error and
  // you might want to take care of it
  e && alert(e);
}
```
### v1 Error checkpoint endpoint

This endpoint is full of errors.

**Method:** `GET`

**Path:** `/v/1/error`

- **Query:**
  - error:
    ```
    <bool>
    ```

- **Returns:**
  - Status: 400
    ```
    { "error": "Text 1" }
    ```
  - Status: 400
    ```
    { "error": "Fieldmissmatch" }
    ```
- **Usage:**
```js
try {
  const response = await get("error", [  ])
    .query({ error })
    .on({ status: 400, error: "Text 1" }, () => {
       /* handle error */
    });
} catch (e) {
  // If e is not false, then no error-catcher caught the error and
  // you might want to take care of it
  e && alert(e);
}
```

  