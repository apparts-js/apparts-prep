import { checkType as recursiveCheck, explainCheck } from "@apparts/types";

export const useChecks = (funktionContainer) => {
  const checked = {};

  if (!funktionContainer || Object.keys(funktionContainer).length === 0) {
    throw new Error("useChecks: The functionContainer is null or empty.");
  }

  const allChecked = (functionName) => {
    if (!funktionContainer[functionName]) {
      throw new Error(
        `Function ### "${functionName}" ### could not be found, maybe you misspelled it?`
      );
    }
    const types = funktionContainer[functionName].options.returns;
    if (
      checked[functionName] &&
      checked[functionName]
        .filter((_, i) => types[i].error !== "Fieldmissmatch")
        .reduce((a, b) => a && b, true)
    ) {
      return true;
    }
    throw new Error(
      `Not all possible return combinations for ### ${functionName} ### have been tested!\nMISSING: ` +
        JSON.stringify(
          types
            .filter((_, i) => !checked[functionName][i])
            .filter((tipe) => tipe.error !== "Fieldmissmatch"),
          undefined,
          2
        )
    );
  };

  const checkType = (response, functionName, options = {}) => {
    if (!funktionContainer[functionName]) {
      throw new Error(
        `Function ### "${functionName}" ### could not be found, maybe you misspelled it?`
      );
    }
    const types = funktionContainer[functionName].options.returns;
    if (!types) {
      console.log("No types found for ###", functionName, "###");
      return false;
    }
    const errors = [];
    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      if (
        type.status === response.statusCode &&
        (JSON.stringify({ error: type.error }) ===
          JSON.stringify({
            ...response.body,
            description: undefined,
          }) ||
          recursiveCheck(response.body, type))
      ) {
        checked[functionName] = checked[functionName] || types.map(() => false);
        checked[functionName][i] = true;
        return true;
      } else {
        errors.push([response.body, type, type.status, response.statusCode]);
      }
    }
    if (options.explainError) {
      console.log("## Explanation for ## " + functionName);
      let counter = 0;
      for (const [body, type, shouldStatus, isStatus] of errors) {
        console.log(
          `\n${++counter}: Status should be ${shouldStatus} and is ${isStatus}`
        );
        if (type.error) {
          console.log("Error should be:");
          console.log(
            explainCheck(body, {
              type: "object",
              keys: {
                error: {
                  value: type.error,
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
          types.filter((tipe) => tipe.error !== "Fieldmissmatch"),
          undefined,
          2
        )
    );
  };
  return { checkType, allChecked };
};
