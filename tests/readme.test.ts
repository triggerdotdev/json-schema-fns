import { s } from "../src";

test("Readme examples work", () => {
  const phoneNumber = s.def("phoneNumber", s.string({ pattern: "^[0-9]{3}-[0-9]{3}-[0-9]{4}$" }));
  const usAddress = s.def(
    "usAddress",
    s.object({
      properties: [s.requiredProperty("zipCode", s.string())],
    }),
  );

  const ukAddress = s.def(
    "ukAddress",
    s.object({
      properties: [s.requiredProperty("postCode", s.string())],
    }),
  );

  const schema = s.object({
    $id: "/schemas/person",
    title: "Person Profile",
    description: "Attributes of a person object",
    examples: [
      {
        name: "Eric",
        email: "eric@stackhero.dev",
      },
    ],
    $comment: "This is just a preview",
    default: {},
    properties: [
      s.requiredProperty("name", s.string()),
      s.property("email", s.string({ format: "email" })),
      s.property("phoneNumber", s.ref("phoneNumber")),
      s.property("billingAddress", s.oneOf(s.ref("ukAddress"), s.ref("usAddress"))),
      s.patternProperty("^[A-Za-z]$", s.string()),
    ],
    additionalProperties: s.array({
      items: s.number({ minimum: 0, maximum: 5000 }),
    }),
    propertyNames: "^[A-Za-z_][A-Za-z0-9_]*$",
    minProperties: 3,
    maxProperties: 20,
    unevaluatedProperties: false,
    defs: [phoneNumber, usAddress, ukAddress],
  });

  expect(schema.toSchemaDocument()).toMatchSnapshot();
});
