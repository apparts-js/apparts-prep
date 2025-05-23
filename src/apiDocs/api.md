
# API Documentation

Commit hash: testcommithash

## Content

- [v1 - POST Testendpoint for multiple purposes /v/1/endpoint/:id](#v1-testendpoint-for-multiple-purposes)
- [v1 - POST Faulty Testendpoint /v/1/faultyendpoint/:id](#v1-faulty-testendpoint)
- [v1 - POST Typeless endpoint /v/1/typelessendpoint](#v1-typeless-endpoint)
- [v1 - POST OneOf endpoint /v/1/cantdecide](#v1-oneof-endpoint)
- [v1 - PUT Endpoint with JWT Authentication /v/1/withjwt](#v1-endpoint-with-jwt-authentication)
- [v1 - GET Error checkpoint endpoint /v/1/error](#v1-error-checkpoint-endpoint)
- [v1 - POST Endpoint with defaults in nested keys /v/1/defaults](#v1-endpoint-with-defaults-in-nested-keys)
## Endpoints


### v1 Testendpoint for multiple purposes

Behaves radically different, based on what
 the filter is.

**Method:** `POST`

**Path:** `/v/1/endpoint/:id`

- **Body:**
                                         - name:
    ```
    ? <string> (= "no name")
    ```
                                                       
- **Params:**
                                         - id:
    ```
    <int>
    ```
                                                       
- **Query:**
                                         - filter:
    ```
    ? <string>
    ```
                                                         - number:
    ```
    ? <int> (= 0)
    ```
                                                       
- **Returns:**
  - Status: 200
    ```
    "ok"
    ```
  - Status: 400
    ```
    {
      "error": "Name too long",
      "description": ? <string>
    }
    ```
  - Status: 200
    ```
    {
      "foo": "really!",
      "boo": <boolean>,
      "kabaz": ? <boolean>,
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
    {
      "error": "Fieldmissmatch",
      "description": ? <string>
    }
    ```
- **Usage:**
```js
try {
  const response = await post("endpoint/$1", [ id ])
    .query({ filter, number })
    .data({ name })
    .on({ status: 400, error: "undefined" }, () => {
       /* handle error */
    })
    .on({ status: 400, error: "undefined" }, () => {
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
    ? <string> (= "no name")
    ```
                                                       
- **Params:**
                                         - id:
    ```
    <int>
    ```
                                                       
- **Query:**
                                         - filter:
    ```
    ? <string>
    ```
                                                       
- **Returns:**
  - Status: 200
    ```
    "ok"
    ```
  - Status: 400
    ```
    {
      "error": "Name too long",
      "description": ? <string>
    }
    ```
  - Status: 200
    ```
    {
      "boo": <boolean>,
      "arr": [
        {
          "a": <int>
        }
      ]
    }
    ```
  - Status: 400
    ```
    {
      "error": "Fieldmissmatch",
      "description": ? <string>
    }
    ```
- **Usage:**
```js
try {
  const response = await post("faultyendpoint/$1", [ id ])
    .query({ filter })
    .data({ name })
    .on({ status: 400, error: "undefined" }, () => {
       /* handle error */
    })
    .on({ status: 400, error: "undefined" }, () => {
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
    {
      "error": "Fieldmissmatch",
      "description": ? <string>
    }
    ```
- **Usage:**
```js
try {
  const response = await post("typelessendpoint", [  ])
    .query({  })
    .data({  })
    .on({ status: 400, error: "undefined" }, () => {
       /* handle error */
    });
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
  - Status: 200
    ```
    "ok"
    ```
  - Status: 400
    ```
    {
      "error": "Fieldmissmatch",
      "description": ? <string>
    }
    ```
- **Usage:**
```js
try {
  const response = await post("cantdecide", [  ])
    .query({  })
    .data({ value })
    .on({ status: 400, error: "undefined" }, () => {
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
  - Status: 200
    ```
    "ok"
    ```
  - Status: 400
    ```
    {
      "error": "Fieldmissmatch",
      "description": ? <string>
    }
    ```
  - Status: 401
    ```
    {
      "error": "Unauthorized",
      "description": ? <string>
    }
    ```
  - Status: 401
    ```
    {
      "error": "Token invalid",
      "description": ? <string>
    }
    ```
- **Usage:**
```js
try {
  const response = await put("withjwt", [  ])
    .query({  })
    .data({  })
    .auth(user)
    .on({ status: 400, error: "undefined" }, () => {
       /* handle error */
    })
    .on({ status: 401, error: "undefined" }, () => {
       /* handle error */
    })
    .on({ status: 401, error: "undefined" }, () => {
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
    <boolean>
    ```
                                                       
- **Returns:**
  - Status: 400
    ```
    {
      "error": "Text 1",
      "description": ? <string>
    }
    ```
  - Status: 400
    ```
    {
      "error": "Text 1",
      "unknownField": <string>
    }
    ```
  - Status: 400
    ```
    {
      "error": "Fieldmissmatch",
      "description": ? <string>
    }
    ```
- **Usage:**
```js
try {
  const response = await get("error", [  ])
    .query({ error })
    .data({  })
    .on({ status: 400, error: "undefined" }, () => {
       /* handle error */
    })
    .on({ status: 400, error: "undefined" }, () => {
       /* handle error */
    })
    .on({ status: 400, error: "undefined" }, () => {
       /* handle error */
    });
} catch (e) {
  // If e is not false, then no error-catcher caught the error and
  // you might want to take care of it
  e && alert(e);
}
```
### v1 Endpoint with defaults in nested keys

This endpoint is full of defaults.

**Method:** `POST`

**Path:** `/v/1/defaults`

- **Body:**
                                         - deep:
    ```
    {
      "hasDefault": ? <string>,
      "doesNotHaveDefault": <string>
    }
    ```
                                                       
- **Returns:**
  - Status: 200
    ```
    "ok"
    ```
  - Status: 400
    ```
    {
      "error": "Fieldmissmatch",
      "description": ? <string>
    }
    ```
- **Usage:**
```js
try {
  const response = await post("defaults", [  ])
    .query({  })
    .data({ deep })
    .on({ status: 400, error: "undefined" }, () => {
       /* handle error */
    });
} catch (e) {
  // If e is not false, then no error-catcher caught the error and
  // you might want to take care of it
  e && alert(e);
}
```

  