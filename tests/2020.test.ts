import {
  s,
  $schema,
  ArraySchema,
  BooleanSchema,
  IntSchema,
  NullSchema,
  NumberSchema,
  ObjectSchema,
  StringSchema,
} from "../src/2020";

describe("simple types", () => {
  test("it should support null schemas", () => {
    expect(s.nil().toSchemaDocument()).toEqual({
      $schema,
      type: "null",
    });
  });

  test("it should support boolean schemas", () => {
    expect(s.boolean().toSchemaDocument()).toEqual({
      $schema,
      type: "boolean",
    });
  });

  test("It should support numeric schemas", () => {
    expect(s.integer().toSchemaDocument()).toEqual({
      $schema,
      type: "integer",
    });

    expect(s.integer({ minimum: 0, maximum: 10 }).toSchemaDocument()).toStrictEqual({
      $schema,
      type: "integer",
      minimum: 0,
      maximum: 10,
    });

    expect(
      s.integer({ exclusiveMinimum: 0, exclusiveMaximum: 10 }).toSchemaDocument(),
    ).toStrictEqual({
      $schema,
      type: "integer",
      exclusiveMinimum: 0,
      exclusiveMaximum: 10,
    });

    expect(s.integer({ multipleOf: 5 }).toSchemaDocument()).toStrictEqual({
      $schema,
      type: "integer",
      multipleOf: 5,
    });

    expect(s.number().toSchemaDocument()).toEqual({
      $schema,
      type: "number",
    });

    expect(s.number({ minimum: 0, maximum: 10 }).toSchemaDocument()).toStrictEqual({
      $schema,
      type: "number",
      minimum: 0,
      maximum: 10,
    });

    expect(
      s.number({ exclusiveMinimum: 0, exclusiveMaximum: 10 }).toSchemaDocument(),
    ).toStrictEqual({
      $schema,
      type: "number",
      exclusiveMinimum: 0,
      exclusiveMaximum: 10,
    });

    expect(s.number({ multipleOf: 5 }).toSchemaDocument()).toStrictEqual({
      $schema,
      type: "number",
      multipleOf: 5,
    });
  });

  test("strings", () => {
    expect(s.string().toSchemaDocument()).toStrictEqual({
      $schema,
      type: "string",
    });

    expect(s.string({ format: "ipv6" }).toSchemaDocument()).toStrictEqual({
      $schema,
      type: "string",
      format: "ipv6",
    });

    expect(s.string({ minLength: 8, maxLength: 32 }).toSchemaDocument()).toStrictEqual({
      $schema,
      type: "string",
      minLength: 8,
      maxLength: 32,
    });

    expect(s.string({ pattern: "*" }).toSchemaDocument()).toStrictEqual({
      $schema,
      type: "string",
      pattern: "*",
    });

    expect(
      s
        .string({ contentMediaType: "application/json", contentEncoding: "base64" })
        .toSchemaDocument(),
    ).toStrictEqual({
      $schema,
      type: "string",
      contentMediaType: "application/json",
      contentEncoding: "base64",
    });
  });

  test("it should support annotations", () => {
    expect(
      s
        .nil({ title: "Hello", description: "This is a description", examples: [1, 2] })
        .toSchemaDocument(),
    ).toEqual({
      $schema,
      title: "Hello",
      description: "This is a description",
      examples: [1, 2],
      type: "null",
    });

    expect(
      s
        .integer({ title: "Hello", description: "This is a description", examples: [1, 2] })
        .toSchemaDocument(),
    ).toEqual({
      $schema,
      title: "Hello",
      description: "This is a description",
      examples: [1, 2],
      type: "integer",
    });

    expect(
      s
        .boolean({ title: "Hello", description: "This is a description", examples: [1, 2] })
        .toSchemaDocument(),
    ).toEqual({
      $schema,
      title: "Hello",
      description: "This is a description",
      examples: [1, 2],
      type: "boolean",
    });

    expect(
      s
        .string({ title: "Hello", description: "This is a description", examples: [1, 2] })
        .toSchemaDocument(),
    ).toEqual({
      $schema,
      title: "Hello",
      description: "This is a description",
      examples: [1, 2],
      type: "string",
    });
  });
});

describe("objects", () => {
  test("it should be able to create simple schemas with annotations", () => {
    expect(
      s
        .object({ title: "Hello", description: "This is a description", examples: [1, 2] })
        .toSchemaDocument(),
    ).toEqual({
      $schema,
      title: "Hello",
      description: "This is a description",
      examples: [1, 2],
      type: "object",
    });
  });

  test("it should support optional properties", () => {
    expect(
      s.object({ properties: [s.property("name", s.string())] }).toSchemaDocument(),
    ).toStrictEqual({
      $schema,
      type: "object",
      properties: {
        name: { type: "string" },
      },
    });
  });

  test("it should support required properties", () => {
    expect(
      s.object({ properties: [s.requiredProperty("name", s.string())] }).toSchemaDocument(),
    ).toStrictEqual({
      $schema,
      type: "object",
      properties: {
        name: { type: "string" },
      },
      required: ["name"],
    });
  });

  test("it should support pattern properties", () => {
    expect(
      s
        .object({ patternProperties: [s.patternProperty("^[A-Za-z]$", s.string())] })
        .toSchemaDocument(),
    ).toStrictEqual({
      $schema,
      type: "object",
      patternProperties: {
        "^[A-Za-z]$": { type: "string" },
      },
    });
  });

  test("it should support additional properties", () => {
    expect(s.object({ additionalProperties: s.string() }).toSchemaDocument()).toStrictEqual({
      $schema,
      type: "object",
      additionalProperties: {
        type: "string",
      },
    });
  });

  test("it should support property names", () => {
    expect(
      s.object({ propertyNames: "^[A-Za-z_][A-Za-z0-9_]*$" }).toSchemaDocument(),
    ).toStrictEqual({
      $schema,
      type: "object",
      propertyNames: {
        pattern: "^[A-Za-z_][A-Za-z0-9_]*$",
      },
    });
  });

  test("it should support key ranges", () => {
    expect(s.object({ minProperties: 3, maxProperties: 10 }).toSchemaDocument()).toStrictEqual({
      $schema,
      type: "object",
      minProperties: 3,
      maxProperties: 10,
    });
  });

  test("it should support unevaluatedProperties", () => {
    expect(s.object({ unevaluatedProperties: false }).toSchemaDocument()).toStrictEqual({
      $schema,
      type: "object",
      unevaluatedProperties: false,
    });
  });

  test("it should support dependent properties", () => {
    expect(
      s
        .object({
          properties: [
            s.property("name", s.string()),
            s.property("email", s.string({ format: "email" }), { dependsOn: ["name"] }),
          ],
        })
        .toSchemaDocument(),
    ).toStrictEqual({
      $schema,
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string", format: "email" },
      },
      dependentRequired: {
        email: ["name"],
      },
    });
  });

  test("it should support dependent schemas", () => {
    expect(
      s
        .object({
          properties: [
            s.property("name", s.string()),
            s.property("creditCard", s.string(), {
              dependentSchema: s.properties(s.requiredProperty("billing", s.string())),
            }),
          ],
        })
        .toSchemaDocument(),
    ).toStrictEqual({
      $schema,
      type: "object",
      properties: {
        name: { type: "string" },
        creditCard: { type: "string" },
      },
      dependentSchemas: {
        creditCard: {
          properties: {
            billing: { type: "string" },
          },
          required: ["billing"],
        },
      },
    });

    expect(
      s
        .object({
          properties: [
            s.property("name", s.string()),
            s.requiredProperty("creditCard", s.string(), {
              dependentSchema: s.properties(s.requiredProperty("billing", s.string())),
            }),
          ],
        })
        .toSchemaDocument(),
    ).toStrictEqual({
      $schema,
      type: "object",
      properties: {
        name: { type: "string" },
        creditCard: { type: "string" },
      },
      required: ["creditCard"],
      dependentSchemas: {
        creditCard: {
          properties: {
            billing: { type: "string" },
          },
          required: ["billing"],
        },
      },
    });
  });
});

describe("arrays", () => {
  test("it should be able to create simple schemas", () => {
    expect(s.array().toSchemaDocument()).toEqual({
      $schema,
      type: "array",
    });

    expect(
      s
        .array({ title: "Hello", description: "This is a description", examples: [1, 2] })
        .toSchemaDocument(),
    ).toEqual({
      $schema,
      title: "Hello",
      description: "This is a description",
      examples: [1, 2],
      type: "array",
    });
  });

  test("it should support item schemas", () => {
    expect(s.array({ items: s.string() }).toSchemaDocument()).toEqual({
      $schema,
      type: "array",
      items: {
        type: "string",
      },
    });
  });

  test("it should support tuple validation", () => {
    expect(
      s.array({ prefixItems: [s.string(), s.integer(), s.boolean()] }).toSchemaDocument(),
    ).toEqual({
      $schema,
      type: "array",
      prefixItems: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
    });

    expect(
      s
        .array({ prefixItems: [s.string(), s.integer(), s.boolean()], items: s.nil() })
        .toSchemaDocument(),
    ).toEqual({
      $schema,
      type: "array",
      prefixItems: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
      items: { type: "null" },
    });

    expect(
      s
        .array({ prefixItems: [s.string(), s.integer(), s.boolean()], items: false })
        .toSchemaDocument(),
    ).toEqual({
      $schema,
      type: "array",
      prefixItems: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
      items: false,
    });
  });

  test("it should support unevaluated items", () => {
    expect(s.array({ items: s.string(), unevaluatedItems: false }).toSchemaDocument()).toEqual({
      $schema,
      type: "array",
      items: { type: "string" },
      unevaluatedItems: false,
    });

    expect(s.array({ items: s.string(), unevaluatedItems: s.string() }).toSchemaDocument()).toEqual(
      {
        $schema,
        type: "array",
        items: { type: "string" },
        unevaluatedItems: { type: "string" },
      },
    );
  });

  test("it should support range schemas", () => {
    expect(s.array({ items: s.string(), minItems: 4, maxItems: 10 }).toSchemaDocument()).toEqual({
      $schema,
      type: "array",
      items: { type: "string" },
      minItems: 4,
      maxItems: 10,
    });
  });

  test("it should support unique items", () => {
    expect(s.array({ items: s.string(), uniqueItems: true }).toSchemaDocument()).toEqual({
      $schema,
      type: "array",
      items: { type: "string" },
      uniqueItems: true,
    });
  });

  test("it should support contain schemas", () => {
    expect(
      s.array({ contains: { schema: s.string(), min: 1, max: 3 } }).toSchemaDocument(),
    ).toEqual({
      $schema,
      type: "array",
      contains: { type: "string" },
      minContains: 1,
      maxContains: 3,
    });
  });
});

describe("schema composition", () => {
  test("it should support allOf", () => {
    expect(s.allOf(s.string(), s.integer()).toSchemaDocument()).toStrictEqual({
      $schema,
      allOf: [{ type: "string" }, { type: "integer" }],
    });
  });

  test("it should support anyOf", () => {
    expect(s.anyOf(s.string(), s.integer()).toSchemaDocument()).toStrictEqual({
      $schema,
      anyOf: [{ type: "string" }, { type: "integer" }],
    });
  });

  test("it should support oneOf", () => {
    expect(s.oneOf(s.string(), s.integer()).toSchemaDocument()).toStrictEqual({
      $schema,
      oneOf: [{ type: "string" }, { type: "integer" }],
    });
  });

  test("it should support not", () => {
    expect(s.not(s.string()).toSchemaDocument()).toStrictEqual({
      $schema,
      not: { type: "string" },
    });
  });
});

describe("conditionals", () => {
  test("should support if-then-else", () => {
    expect(s.ifThenElse(s.boolean(), s.string(), s.integer()).toSchemaDocument()).toStrictEqual({
      $schema,
      if: { type: "boolean" },
      then: { type: "string" },
      else: { type: "integer" },
    });

    expect(s.ifThen(s.boolean(), s.string()).toSchemaDocument()).toStrictEqual({
      $schema,
      if: { type: "boolean" },
      then: { type: "string" },
    });
  });
});

describe("structuring", () => {
  test("should support referencing a definition", () => {
    const emailDefinition = s.def("email", s.string({ format: "email" }));

    const objectSchema = s.object({
      properties: [s.property("email", s.ref("email")), s.property("friend", s.ref("email"))],
      defs: [emailDefinition],
    });

    expect(objectSchema.toSchemaDocument()).toStrictEqual({
      $schema,
      type: "object",
      properties: {
        email: { $ref: "#/$defs/email" },
        friend: { $ref: "#/$defs/email" },
      },
      $defs: {
        email: { type: "string", format: "email" },
      },
    });

    const arraySchema = s.array({
      items: s.ref("email"),
      defs: [emailDefinition],
    });

    expect(arraySchema.toSchemaDocument()).toStrictEqual({
      $schema,
      type: "array",
      items: {
        $ref: "#/$defs/email",
      },
      $defs: {
        email: { type: "string", format: "email" },
      },
    });
  });
});

describe("const and enums", () => {
  test("They should work", () => {
    expect(s.constant("foo").toSchemaDocument()).toStrictEqual({
      $schema,
      const: "foo",
    });

    expect(s.enumerator("foo", "bar").toSchemaDocument()).toStrictEqual({
      $schema,
      enum: ["foo", "bar"],
    });
  });
});

describe("types", () => {
  test("Types to create object schemas", () => {
    const foo: ObjectSchema = {
      $schema,
      type: "object",
      properties: {
        bar: {
          type: "string",
        },
      },
      required: ["bar"],
      additionalProperties: {
        type: "number",
      },
      unevaluatedProperties: true,
      propertyNames: {
        pattern: "^[a-z]+$",
      },
      patternProperties: {
        "^[a-z]+$": {
          type: "string",
        },
      },
      maxProperties: 10,
      minProperties: 1,
      dependentRequired: {
        foo: ["bar"],
      },
      dependentSchemas: {
        foo: {
          properties: {
            bar: {
              type: "string",
            },
          },
          required: ["bar"],
        },
      },
      $id: "foo",
      title: "foo",
      description: "bar",
      $comment: "baz",
      default: [],
      examples: [[1, 2, 3]],
      deprecated: true,
      readOnly: true,
      writeOnly: false,
    };

    expect(foo.type).toBe("object");
  });

  test("Types to create string schemas", () => {
    const foo: StringSchema = {
      $schema,
      type: "string",
      enum: ["foo", "bar"],
      format: "email",
      pattern: "^[a-z]+$",
      minLength: 1,
      maxLength: 10,
      $id: "foo",
      title: "foo",
      description: "bar",
      $comment: "baz",
      default: [],
      examples: [[1, 2, 3]],
      deprecated: true,
      readOnly: true,
      writeOnly: false,
    };

    expect(foo.type).toBe("string");
  });

  test("Types to create array schemas", () => {
    const foo: ArraySchema = {
      $schema,
      type: "array",
      items: {
        type: "string",
      },
      prefixItems: [{ type: "string" }, { type: "number" }],
      unevaluatedItems: { type: "string" },
      minItems: 1,
      maxItems: 10,
      uniqueItems: true,
      contains: { type: "string" },
      maxContains: 10,
      minContains: 1,
      $id: "foo",
      title: "foo",
      description: "bar",
      $comment: "baz",
      default: [],
      examples: [[1, 2, 3]],
      deprecated: true,
      readOnly: true,
      writeOnly: false,
    };

    expect(foo.type).toBe("array");
  });

  test("types to create integer schemas", () => {
    const foo: IntSchema = {
      $schema,
      type: "integer",
      enum: [1, 2, 3],
      minimum: 1,
      maximum: 10,
      $id: "foo",
      title: "foo",
      description: "bar",
      $comment: "baz",
      default: [],
      examples: [1, 2, 3],
      deprecated: true,
      readOnly: true,
      writeOnly: false,
    };

    expect(foo.type).toBe("integer");
  });

  test("types to create number schemas", () => {
    const foo: NumberSchema = {
      $schema,
      type: "number",
      enum: [1, 2, 3],
      minimum: 1,
      maximum: 10,
      $id: "foo",
      title: "foo",
      description: "bar",
      $comment: "baz",
      default: [],
      examples: [1, 2, 3],
      deprecated: true,
      readOnly: true,
      writeOnly: false,
    };

    expect(foo.type).toBe("number");
  });

  test("other types schemas", () => {
    const boolSchema: BooleanSchema = {
      $schema,
      type: "boolean",
      $id: "foo",
      title: "foo",
      description: "bar",
      $comment: "baz",
      default: [],
      examples: [1, 2, 3],
      deprecated: true,
      readOnly: true,
      writeOnly: false,
    };

    expect(boolSchema.type).toBe("boolean");

    const nullSchema: NullSchema = {
      $schema,
      type: "null",
      $id: "foo",
      title: "foo",
      description: "bar",
      $comment: "baz",
      default: [],
      examples: [1, 2, 3],
      deprecated: true,
      readOnly: true,
      writeOnly: false,
    };

    expect(nullSchema.type).toBe("null");
  });
});
