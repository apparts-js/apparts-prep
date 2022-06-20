const any = async (tipe, path, right, _, isParams, isQuery) => {
  if (isParams || isQuery) {
    await right(path, 4, tipe, "4");
    await right(path, ["a", 3], tipe, '["a",3]');
    await right(path, { an: "object" }, tipe, '{"an":"object"}');
    await right(path, true, tipe, "true");
    await right(path, null, tipe, "null");
  } else {
    await right(path, 4);
    await right(path, ["a", 3]);
    await right(path, { an: "object" });
    await right(path, true);
    await right(path, null);
  }
  await right(path, "its a string");
  await right(path, "7ce767a4-ec6e-4ff5-b163-f501165eaf83");
  await right(path, "3");
};

const id = async (tipe, path, right, wrong, isParams, isQuery) => {
  await wrong(path, 4.4, tipe);
  await wrong(path, [], tipe);
  await wrong(path, ["a", 3], tipe);
  await wrong(path, { an: "object" }, tipe);
  await wrong(path, "its a string", tipe);
  if (!isParams) {
    await wrong(path, "", tipe);
  }
  if (isParams || isQuery) {
    await right(path, "3", tipe, 3);
    await right(path, "-4", tipe, -4);
  } else {
    await wrong(path, "3", tipe);
    await wrong(path, "-4", tipe);
  }
  await right(path, 3, tipe);
  await right(path, 0, tipe);
  await right(path, -4, tipe);
  await wrong(path, true, tipe);
  await wrong(path, false, tipe);
  await wrong(path, null, tipe);
  await wrong(path, "ABCDEF1234567890", tipe);
  await wrong(path, "dGVzdA==", tipe);
};

const uuidv4 = async (tipe, path, right, wrong, isParams) => {
  await right(path, "7ce767a4-ec6e-4ff5-b163-f501165eaf83", tipe);
  await wrong(path, 4, tipe);
  await wrong(path, 4.4, tipe);
  await wrong(path, [], tipe);
  await wrong(path, ["a", 3], tipe);
  await wrong(path, { an: "object" }, tipe);
  await wrong(path, "its a string", tipe);
  await wrong(path, "7ce767a4-ec6e-5ff5-b163-f501165eaf83", tipe);
  await wrong(path, "7ce767a4ec6e-4ff5-b163-f501165eaf83", tipe);
  await wrong(path, "7ce767a4-ec6e-4ff5-b163-f501165eaf8", tipe);
  await wrong(path, "7ce767a4-ec6e-4ff5-b163-g501165eaf83", tipe);
  await wrong(path, "7ce76a4-ec6e-4ff5-b163-f501165eaf83", tipe);
  if (!isParams) {
    await wrong(path, "", tipe);
  }
  await wrong(path, "3", tipe);
  await wrong(path, true, tipe);
  await wrong(path, false, tipe);
  await wrong(path, null, tipe);
  await wrong(path, "ABCDEF1234567890", tipe);
  await wrong(path, "dGVzdA==", tipe);
};

const int = id;

const float = async (tipe, path, right, wrong, isParams, isQuery) => {
  await right(path, 4, tipe);
  await right(path, 4.4, tipe);
  await right(path, -4, tipe);
  await right(path, -4.4, tipe);
  await wrong(path, [], tipe);
  await wrong(path, ["a", 3], tipe);
  await wrong(path, { an: "object" }, tipe);
  await wrong(path, "its a string", tipe);
  await wrong(path, "7ce767a4-ec6e-4ff5-b163-f501165eaf83", tipe);
  if (!isParams) {
    await wrong(path, "", tipe);
  }
  if (isParams || isQuery) {
    await right(path, "3", tipe, 3);
    await right(path, "-3.9", tipe, -3.9);
  } else {
    await wrong(path, "3", tipe);
    await wrong(path, "-3.9", tipe);
  }
  await wrong(path, true, tipe);
  await wrong(path, false, tipe);
  await wrong(path, null, tipe);
  await wrong(path, "ABCDEF1234567890", tipe);
  await wrong(path, "dGVzdA==", tipe);
};

const hex = async (tipe, path, right, wrong, isParams, isQuery) => {
  if (isParams || isQuery) {
    await right(path, 4, tipe, "4");
  } else {
    await wrong(path, 4, tipe);
  }
  if (!isParams) {
    await wrong(path, "", tipe);
  }
  await wrong(path, 4.4, tipe);
  await wrong(path, [], tipe);
  await wrong(path, ["a", 3], tipe);
  await wrong(path, { an: "object" }, tipe);
  await wrong(path, "its a string", tipe);
  await wrong(path, "7ce767a4-ec6e-4ff5-b163-f501165eaf83", tipe);
  await right(path, "3", tipe);
  await wrong(path, true, tipe);
  await wrong(path, false, tipe);
  await wrong(path, null, tipe);
  await right(path, "ABCDEF1234567890", tipe);
  await wrong(path, "dGVzdA==", tipe);
};

const base64 = async (tipe, path, right, wrong, isParams, isQuery) => {
  if (isParams || isQuery) {
    await right(path, 6455, tipe, "6455");
  } else {
    await wrong(path, 6455, tipe);
  }
  await wrong(path, 4.4, tipe);
  await wrong(path, [], tipe);
  await wrong(path, ["a", 3], tipe);
  await wrong(path, { an: "object" }, tipe);
  await wrong(path, "its a string", tipe);
  await wrong(path, "7ce767a4-ec6e-4ff5-b163-f501165eaf83", tipe);
  if (!isParams) {
    await right(path, "", tipe);
  }
  if (!isParams && !isQuery) {
    await wrong(path, true, tipe);
    await wrong(path, false, tipe);
    await wrong(path, null, tipe);
  }
  await wrong(path, "3", tipe);
  await wrong(path, "ABCDEF1234567890=", tipe);
  await right(path, "ABCDEF1234567890", tipe);
  await right(path, "dGVzdA==", tipe);
};

const bool = async (tipe, path, right, wrong, isParams) => {
  await wrong(path, 4, tipe);
  await wrong(path, 4.4, tipe);
  await wrong(path, [], tipe);
  await wrong(path, ["a", 3], tipe);
  await wrong(path, { an: "object" }, tipe);
  await wrong(path, "its a string", tipe);
  await wrong(path, "7ce767a4-ec6e-4ff5-b163-f501165eaf83", tipe);
  if (!isParams) {
    await wrong(path, "", tipe);
  }
  await wrong(path, "3", tipe);
  await right(path, true, tipe);
  await right(path, false, tipe);
  await wrong(path, null, tipe);
  await wrong(path, "ABCDEF1234567890", tipe);
  await wrong(path, "dGVzdA==", tipe);
};

const string = async (tipe, path, right, wrong, isParams, isQuery) => {
  if (isParams || isQuery) {
    await right(path, 4, tipe, "4");
    await right(path, 4.4, tipe, "4.4");
    await right(path, true, tipe, "true");
    await right(path, false, tipe, "false");
    await right(path, null, tipe, "null");
    await right(path, [], tipe, "[]");
    await right(path, ["a", 3], tipe, '["a",3]');
    await right(path, { an: "object" }, tipe, '{"an":"object"}');
  } else {
    await wrong(path, 4, tipe);
    await wrong(path, 4.4, tipe);
    await wrong(path, true, tipe);
    await wrong(path, false, tipe);
    await wrong(path, null, tipe);
    await wrong(path, [], tipe);
    await wrong(path, ["a", 3], tipe);
    await wrong(path, { an: "object" }, tipe);
    await right(path, "", tipe);
  }
  if (!isParams) {
    await right(path, "", tipe);
  }
  await right(path, encodeURIComponent("%rty"), tipe);
  await right(path, "its a&stri=ng", tipe);
  await right(path, "its a/string", tipe);
  await right(path, "its a string", tipe);
  await right(path, "7ce767a4-ec6e-4ff5-b163-f501165eaf83", tipe);
  await right(path, "3", tipe);
  await right(path, "ABCDEF1234567890", tipe);
  await right(path, "dGVzdA==", tipe);
};

const email = async (tipe, path, right, wrong, isParams) => {
  await wrong(path, 4, tipe);
  await wrong(path, 4.4, tipe);
  await wrong(path, [], tipe);
  await wrong(path, ["a", 3], tipe);
  await wrong(path, { an: "object" }, tipe);
  await wrong(path, "its a string", tipe);
  await wrong(path, "7ce767a4-ec6e-4ff5-b163-f501165eaf83", tipe);
  if (!isParams) {
    await wrong(path, "", tipe);
  }
  await wrong(path, "3", tipe);
  await wrong(path, true, tipe);
  await wrong(path, false, tipe);
  await wrong(path, null, tipe);
  await wrong(path, "ABCDEF1234567890", tipe);
  await wrong(path, "dGVzdA==", tipe);
  await wrong(path, "@def.gh", tipe);
  await wrong(path, "abcdef.gh", tipe);
  await wrong(path, "abc@defgh", tipe);
  await wrong(path, "abc@def.g", tipe);
  await wrong(path, "abc@.gh", tipe);
  await right(path, "abc@def.gh", tipe);
  await right(path, "abc@base.kitchen", tipe);
};

const array = async (tipe, path, right, wrong, isParams) => {
  await wrong(path, 4, tipe);
  await wrong(path, 4.4, tipe);
  await right(path, [], tipe);
  await right(path, ["abc@def.gh", "abc1@def.gh", "abc3@def.gh"], tipe);
  await wrong(path, ["a", 3], tipe);
  await wrong(path, ["a", 3, true, false, null, undefined, 3.3], tipe);
  await wrong(path, { an: "object" }, tipe);
  await wrong(path, "its a string", tipe);
  await wrong(path, "7ce767a4-ec6e-4ff5-b163-f501165eaf83", tipe);
  if (!isParams) {
    await wrong(path, "", tipe);
  }
  await wrong(path, "3", tipe);
  await wrong(path, true, tipe);
  await wrong(path, false, tipe);
  await wrong(path, null, tipe);
  await wrong(path, "ABCDEF1234567890", tipe);
  await wrong(path, "dGVzdA==", tipe);
};

const arrayInt = async (tipe, path, right, wrong, isParams) => {
  await wrong(path, 4, tipe);
  await wrong(path, 4.4, tipe);
  await right(path, [], tipe);
  await wrong(path, ["a", 3], tipe);
  await wrong(path, [1, "3"], tipe);
  await wrong(path, [1, 3.141], tipe);
  await right(path, [1, 3], tipe);
  await wrong(path, { an: "object" }, tipe);
  await wrong(path, "its a string", tipe);
  await wrong(path, "7ce767a4-ec6e-4ff5-b163-f501165eaf83", tipe);
  if (!isParams) {
    await wrong(path, "", tipe);
  }
  await wrong(path, "3", tipe);
  await wrong(path, true, tipe);
  await wrong(path, false, tipe);
  await wrong(path, null, tipe);
  await wrong(path, "ABCDEF1234567890", tipe);
  await wrong(path, "dGVzdA==", tipe);
};

const arrayId = async (tipe, path, right, wrong, isParams) => {
  await wrong(path, 4, tipe);
  await wrong(path, 4.4, tipe);
  await right(path, [], tipe);
  await wrong(path, ["a", 3], tipe);
  await wrong(path, [1, "3"], tipe);
  await wrong(path, [1, 3.141], tipe);
  await right(path, [1, 3], tipe);
  await wrong(path, { an: "object" }, tipe);
  await wrong(path, "its a string", tipe);
  await wrong(path, "7ce767a4-ec6e-4ff5-b163-f501165eaf83", tipe);
  if (!isParams) {
    await wrong(path, "", tipe);
  }
  await wrong(path, "3", tipe);
  await wrong(path, true, tipe);
  await wrong(path, false, tipe);
  await wrong(path, null, tipe);
  await wrong(path, "ABCDEF1234567890", tipe);
  await wrong(path, "dGVzdA==", tipe);
};

const password = string;

const time = async (tipe, path, right, wrong, isParams, isQuery) => {
  await right(path, 4, tipe);
  await wrong(path, 4.4, tipe);
  await wrong(path, [], tipe);
  await wrong(path, ["a", 3], tipe);
  await wrong(path, { an: "object" }, tipe);
  await wrong(path, "its a string", tipe);
  await wrong(path, "7ce767a4-ec6e-4ff5-b163-f501165eaf83", tipe);
  if (!isParams) {
    await wrong(path, "", tipe);
  }
  if (isParams || isQuery) {
    await right(path, "3", tipe, 3);
  } else {
    await wrong(path, "3", tipe);
  }
  await wrong(path, true, tipe);
  await wrong(path, false, tipe);
  await wrong(path, null, tipe);
  await wrong(path, "ABCDEF1234567890", tipe);
  await wrong(path, "dGVzdA==", tipe);
};

const arrayTime = async (tipe, path, right, wrong, isParams) => {
  await wrong(path, 4, tipe);
  await wrong(path, 4.4, tipe);
  await right(path, [], tipe);
  await wrong(path, ["a", 3], tipe);
  await wrong(path, [1, "3"], tipe);
  await wrong(path, [1, 3.141], tipe);
  await right(path, [1, 3], tipe);
  await wrong(path, { an: "object" }, tipe);
  await wrong(path, "its a string", tipe);
  await wrong(path, "7ce767a4-ec6e-4ff5-b163-f501165eaf83", tipe);
  if (!isParams) {
    await wrong(path, "", tipe);
  }
  await wrong(path, "3", tipe);
  await wrong(path, true, tipe);
  await wrong(path, false, tipe);
  await wrong(path, null, tipe);
  await wrong(path, "ABCDEF1234567890", tipe);
  await wrong(path, "dGVzdA==", tipe);
};

const object = async (tipe, path, right, wrong, isParams) => {
  await wrong(path, 4, tipe);
  await wrong(path, 4.4, tipe);
  await wrong(path, [], tipe);
  await wrong(path, ["abc@def.gh", "abc1@def.gh", "abc3@def.gh"], tipe);
  await wrong(path, ["a", 3], tipe);
  await wrong(path, ["a", 3, true, false, null, undefined, 3.3], tipe);
  await wrong(path, { an: "object" }, tipe);
  await wrong(path, "its a string", tipe);
  await wrong(path, "7ce767a4-ec6e-4ff5-b163-f501165eaf83", tipe);
  if (!isParams) {
    await wrong(path, "", tipe);
  }
  await wrong(path, "3", tipe);
  await wrong(path, true, tipe);
  await wrong(path, false, tipe);
  await wrong(path, null, tipe);
  await wrong(path, "ABCDEF1234567890", tipe);
  await wrong(path, "dGVzdA==", tipe);
  await wrong(path, {}, tipe);
  await wrong(path, { firstKey: "abc@de.de" }, tipe);
  await wrong(
    path,
    { firstKey: "abc@de.de", secondKey: 3, thirdKey: true },
    tipe
  );
  await right(path, { firstKey: "abc@de.de", secondKey: 3 }, tipe);
  await wrong(path, { firstKey: "abc@de.de", secondKey: 3.3 }, tipe);
};

module.exports = {
  id,
  uuidv4,
  "/": any,
  int,
  float,
  hex,
  base64,
  bool,
  string,
  email,
  array,
  array_int: arrayInt,
  array_id: arrayId,
  password,
  time,
  array_time: arrayTime,
  object,
};
