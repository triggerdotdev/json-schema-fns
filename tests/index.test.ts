import { s } from "../src";

test("it should use draft 2020 by default", () => {
  expect(s.string().toSchemaDocument()).toEqual({
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "string",
  });
});
