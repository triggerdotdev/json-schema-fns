# json-schema-fns

> Modern utility library and typescript typings for building JSON Schema documents dynamically

<!-- ![Coverage lines](./badges/badge-lines.svg) -->
<!-- ![Tests](https://github.com/jsonhero-io/json-schema-fns/actions/workflows/test.yml/badge.svg?branch=main) -->
<!-- [![Downloads](https://img.shields.io/npm/dm/%40jsonhero%2Fjson-schema-fns.svg)](https://npmjs.com/@jsonhero/json-schema-fns) -->
<!-- [![Install size](https://packagephobia.com/badge?p=%40jsonhero%2Fjson-schema-fns)](https://packagephobia.com/result?p=@jsonhero/json-schema-fns) -->

## Features

- Build JSON Schema documents for various drafts (currently only draft-2020-12 but more coming soon)
- Strongly typed documents using Typescript
- Allows you to build correct JSON Schema documents using dynamic data

## Usage

Create a simple draft-2020-12 document:

```ts
import { s } from "json-schema-fns";

const schema = s.object({
  properties: [s.requiredProperty("foo", s.string()), s.property("bar", s.int())],
});

schema.toSchemaDocument();
```

Will result in

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema#",
  "$id": "https://jsonhero.io/schemas/root.json",
  "type": "object",
  "properties": {
    "foo": { "type": "string" },
    "bar": { "type": "integer" }
  },
  "required": ["foo"]
}
```

You can also import the types for a specific draft to use, like so:

```typescript
import { s, Schema, IntSchema, StringSchema, StringFormat } from "json-schema-fns";

function buildIntSchema(maximum: number, minimum: number): IntSchema {
  return s.int({ minimum, maximum });
}

function buildStringFormat(format: JSONStriStringFormatgFormat): StringSchema {
  return s.string({ format });
}
```

`json-schema-fns` support all the features of JSON schema:

```typescript
import { s } from "json-schema-fns";

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

s.object({
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
  ],
  patternProperties: [s.patternProperty("^[A-Za-z]$", s.string())],
  additionalProperties: s.array({
    items: s.number({ minimum: 0, maximum: 5000 }),
  }),
  propertyNames: "^[A-Za-z_][A-Za-z0-9_]*$",
  minProperties: 3,
  maxProperties: 20,
  unevaluatedProperties: false,
  defs: [phoneNumber, usAddress, ukAddress],
}).toSchemaDocument();
```

Will result in

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "$id": "/schemas/person",
  "title": "Person Profile",
  "description": "Attributes of a person object",
  "examples": [
    {
      "name": "Eric",
      "email": "eric@stackhero.dev"
    }
  ],
  "$comment": "This is just a preview",
  "default": {},
  "minProperties": 3,
  "maxProperties": 20,
  "unevaluatedProperties": false,
  "properties": {
    "name": {
      "type": "string"
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "phoneNumber": {
      "$ref": "#/$defs/phoneNumber"
    },
    "billingAddress": {
      "oneOf": [
        {
          "$ref": "#/$defs/ukAddress"
        },
        {
          "$ref": "#/$defs/usAddress"
        }
      ]
    }
  },
  "required": ["name"],
  "patternProperties": {
    "^[A-Za-z]$": {
      "type": "string"
    }
  },
  "propertyNames": {
    "pattern": "^[A-Za-z_][A-Za-z0-9_]*$"
  },
  "additionalProperties": {
    "type": "array",
    "items": {
      "type": "number",
      "minimum": 0,
      "maximum": 5000
    }
  },
  "$defs": {
    "phoneNumber": {
      "type": "string",
      "pattern": "^[0-9]{3}-[0-9]{3}-[0-9]{4}$"
    },
    "usAddress": {
      "type": "object",
      "properties": {
        "zipCode": {
          "type": "string"
        }
      },
      "required": ["zipCode"]
    },
    "ukAddress": {
      "type": "object",
      "properties": {
        "postCode": {
          "type": "string"
        }
      },
      "required": ["postCode"]
    }
  }
}
```

# API

## `s`

All the builder methods for creating subschemas are available on the `s` object

```typescript
import { s } from "json-schema-fns";
```

Or if you want to import a specific dialect:

```typescript
import { s } from "json-schema-fns/2020";
```

### `object`

### `array`

### `string`

### `integer` and `number`

### `nil`

### `boolean`

## Roadmap

- Support draft-04
- Support draft-06
- Support draft-07
- Support draft/2019-09
