import {
  Type,
  checkType as recursiveCheck,
  explainCheck,
  ObjType,
  ValueType,
} from "@apparts/types";

export const isNotFieldmissmatch = (type: Type) => {
  return !(
    "keys" in type &&
    "code" in type.keys &&
    "value" in type.keys.code &&
    type.keys.code.value === 400 &&
    "type" in type.keys &&
    "value" in type.keys.type &&
    type.keys.type.value === "HttpError" &&
    "message" in type.keys &&
    "keys" in type.keys.message &&
    "error" in type.keys.message.keys &&
    "value" in type.keys.message.keys.error &&
    type.keys.message.keys.error.value === "Fieldmissmatch"
  );
};

const getTypeStatusCode = (type: Type) => {
  if (
    "keys" in type &&
    "code" in type.keys &&
    "type" in type.keys &&
    "value" in type.keys.code &&
    "value" in type.keys.type &&
    (type.keys.type.value === "HttpError" ||
      type.keys.type.value === "HttpCode")
  ) {
    return type.keys.code.value as number;
  }
  return 200;
};

const getTypeErrorMessage = (type: Type) => {
  if (
    "keys" in type &&
    "code" in type.keys &&
    "type" in type.keys &&
    "value" in type.keys.type &&
    (type.keys.type.value === "HttpError" ||
      type.keys.type.value === "HttpCode")
  ) {
    return type.keys.message;
  }
  return null;
};

type TestableFunction = {
  options: { returns: Type[] };
};

type UseChecksReturnType = {
  checkType: (
    response: {
      body: unknown;
      statusCode: number;
    },
    functionName: string,
    options?: {
      explainError?: boolean;
    }
  ) => boolean;
  allChecked: (functionName: string) => boolean;
};

export function useChecks(
  funktionContainer: Record<string, TestableFunction>
): UseChecksReturnType;
export function useChecks<T>(
  funktionContainer: Record<string, T>,
  prepareFunction: (t: T) => TestableFunction
): UseChecksReturnType;
export function useChecks<T>(
  funktionContainer: Record<string, T>,
  _prepareFunction?: (t: T) => TestableFunction
) {
  const prepareFunction =
    _prepareFunction || ((t) => t as unknown as TestableFunction);

  const checked: Record<string, boolean[]> = {};

  if (!funktionContainer || Object.keys(funktionContainer).length === 0) {
    throw new Error("useChecks: The functionContainer is null or empty.");
  }

  const allChecked = (functionName: string) => {
    if (!funktionContainer[functionName]) {
      throw new Error(
        `Function ### "${functionName}" ### could not be found, maybe you misspelled it?`
      );
    }
    const types = prepareFunction(funktionContainer[functionName]).options
      .returns;

    if (
      checked[functionName] &&
      checked[functionName]
        .filter((_, i) => isNotFieldmissmatch(types[i]))
        .reduce((a, b) => a && b, true)
    ) {
      return true;
    }
    throw new Error(
      `Not all possible return combinations for ### ${functionName} ### have been tested!\nMISSING: ` +
        JSON.stringify(
          types
            .filter((_, i) => !checked[functionName]?.[i])
            .filter((t) => isNotFieldmissmatch(t))
            .map((t) => {
              const e = getTypeErrorMessage(t);
              return e ? e : t;
            }),
          undefined,
          2
        )
    );
  };

  const checkType = (
    response: {
      body: unknown;
      statusCode: number;
    },
    functionName: string,
    options: { explainError?: boolean } = {}
  ) => {
    if (!funktionContainer[functionName]) {
      throw new Error(
        `Function ### "${functionName}" ### could not be found, maybe you misspelled it?`
      );
    }
    const types = prepareFunction(funktionContainer[functionName]).options
      .returns;
    if (!types) {
      console.log("No types found for ###", functionName, "###");
      return false;
    }
    const errors: [unknown, Type, number, number, boolean][] = [];
    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      const errorMessage = getTypeErrorMessage(type);
      const statusCode = getTypeStatusCode(type);
      if (
        statusCode === response.statusCode &&
        (errorMessage
          ? recursiveCheck(response.body, errorMessage)
          : recursiveCheck(response.body, type))
      ) {
        checked[functionName] = checked[functionName] || types.map(() => false);
        checked[functionName][i] = true;
        return true;
      } else {
        errors.push([
          response.body,
          errorMessage ? errorMessage : type,
          statusCode,
          response.statusCode,
          Boolean(errorMessage),
        ]);
      }
    }
    if (options.explainError) {
      console.log("## Explanation for ## " + functionName);
      let counter = 0;
      for (const [
        body,
        type,
        shouldStatus,
        isStatus,
        shuoldBeError,
      ] of errors) {
        console.log(
          `\n${++counter}: Status should be ${shouldStatus} and is ${isStatus}`
        );
        if (shuoldBeError) {
          console.log("Error should be:");
          console.log(
            explainCheck(body, {
              type: "object",
              keys: {
                error: {
                  value: ((type as ObjType).keys.error as ValueType).value,
                },
                description: {
                  type: "string",
                  optional: true,
                },
              },
            })
          );
        } else {
          console.log("Type check yields:");
          console.log(explainCheck(body, type));
        }
      }
    }
    throw new Error(
      "Returntype for ### " +
        functionName +
        " ### does not match any given pattern!\nMISSMATCH: " +
        "Code: " +
        response.statusCode +
        " Body: " +
        JSON.stringify(response.body) +
        "\nEXPECTED TYPES: " +
        JSON.stringify(
          types
            .filter((_, i) => isNotFieldmissmatch(types[i]))
            .map((t) => {
              const e = getTypeErrorMessage(t);
              return e ? e : t;
            }),
          undefined,
          2
        )
    );
  };
  return { checkType, allChecked };
}
