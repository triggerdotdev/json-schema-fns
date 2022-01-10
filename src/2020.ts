/* eslint-disable @typescript-eslint/no-explicit-any */
import deepmerge from "deepmerge";
import omit from "lodash/omit";

type TypeName = "string" | "number" | "integer" | "boolean" | "object" | "array" | "null";

type AnnotationSchema = {
  $id?: string;
  $comment?: string;
  default?: any;
  title?: string;
  description?: string;
  examples?: any[];
  deprecated?: boolean;
  readOnly?: boolean;
  writeOnly?: boolean;
};

type BaseSchema = AnnotationSchema & {
  $schema?: string;
  $ref?: string;
  $anchor?: string;
  $defs?: { [key: string]: Schema };

  type?: TypeName | TypeName[];
  enum?: any[];
  const?: any;

  allOf?: Schema[];
  anyOf?: Schema[];
  oneOf?: Schema[];
  not?: Schema;

  // Conditional schemas
  if?: Schema;
  then?: Schema;
  else?: Schema;
};

export type Schema = boolean | SchemaDocument | AnySchema;

export type SchemaDocument =
  | StringSchema
  | NumberSchema
  | IntSchema
  | ObjectSchema
  | ArraySchema
  | BooleanSchema
  | NullSchema;

export type AnySchema = BaseSchema;

export type StringFormat =
  | "date-time"
  | "time"
  | "date"
  | "duration"
  | "email"
  | "idn-email"
  | "hostname"
  | "idn-hostname"
  | "ipv4"
  | "ipv6"
  | "uuid"
  | "uri"
  | "uri-reference"
  | "iri"
  | "iri-reference"
  | "uri-template"
  | "json-pointer"
  | "relative-json-pointer"
  | "regex";

type MimeType =
  | "application/json"
  | "application/xml"
  | "text/xml"
  | "text/html"
  | "text/plain"
  | "application/octet-stream"
  | "text/css"
  | "text/csv"
  | "text/javascript"
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp"
  | "image/bmp"
  | "image/apng"
  | "image/svg+xml"
  | "image/avif"
  | "video/webm"
  | "video/mp4"
  | "video/ogg"
  | "multipart/form-data";

type Encoding = "7bit" | "8bit" | "binary" | "quoted-printable" | "base16" | "base32" | "base64";

export type StringSchema = BaseSchema & {
  type: "string";
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: StringFormat;
  contentMediaType?: MimeType;
  contentEncoding?: Encoding;
};

type NumericSchema = BaseSchema & {
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
};

export type IntSchema = NumericSchema & {
  type: "integer";
};

export type NumberSchema = NumericSchema & {
  type: "number";
};

export type PropertiesSchema = {
  properties?: Record<string, Schema>;
  required?: string[];
  patternProperties?: Record<string, Schema>;
  additionalProperties?: Schema;
  unevaluatedProperties?: boolean;
  propertyNames?: { pattern: string };
  minProperties?: number;
  maxProperties?: number;
};

export type ObjectSchema = BaseSchema &
  PropertiesSchema & {
    type: "object" | undefined;
    dependentRequired?: Record<string, string[]>;
    dependentSchemas?: Record<string, PropertiesSchema>;
  };

export type ArraySchema = BaseSchema & {
  type: "array" | undefined;
  items?: Schema;
  prefixItems?: Schema[];
  unevaluatedItems?: Schema;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  contains?: Schema;
  maxContains?: number;
  minContains?: number;
};

export type BooleanSchema = BaseSchema & {
  type: "boolean";
};

export type NullSchema = BaseSchema & {
  type: "null";
};

export const $schema = "https://json-schema.org/draft/2020-12/schema";

export class SchemaBuilder<S extends Schema> {
  schema: S;

  constructor(s: S) {
    this.schema = s;
  }

  apply(builder: SchemaBuilder<S>) {
    this.schema = deepmerge(this.schema as any, builder.schema as any);
  }

  toSchema(): S {
    return this.schema;
  }

  toSchemaDocument(): Schema {
    if (typeof this.schema === "boolean") {
      return this.schema;
    }

    return {
      $schema,
      ...this.schema,
    };
  }
}

const objectBuilder = (schema: Partial<ObjectSchema>): SchemaBuilder<ObjectSchema> =>
  new SchemaBuilder<ObjectSchema>({
    ...schema,
  } as ObjectSchema);

type ObjectOptions = {
  properties?: Array<SchemaBuilder<ObjectSchema>>;
  propertyNames?: string;
  patternProperties?: Array<SchemaBuilder<ObjectSchema>>;
  additionalProperties?: SchemaBuilder<Schema>;
  minProperties?: number;
  maxProperties?: number;
  unevaluatedProperties?: boolean;
  defs?: Array<SchemaBuilder<Schema>>;
} & AnnotationSchema;

function object(options?: ObjectOptions): SchemaBuilder<ObjectSchema> {
  const properties = options?.properties || [];
  const patternProperties = options?.patternProperties || [];

  const additionalOptions = omit(options, [
    "properties",
    "patternProperties",
    "propertyNames",
    "additionalProperties",
    "defs",
  ]) as Omit<ObjectSchema, "type">;

  const schema = new SchemaBuilder<ObjectSchema>({
    type: "object",
    ...additionalOptions,
  });

  for (const property of properties) {
    schema.apply(property);
  }

  for (const property of patternProperties) {
    schema.apply(property);
  }

  if (options?.propertyNames) {
    schema.apply(
      objectBuilder({
        propertyNames: {
          pattern: options.propertyNames,
        },
      }),
    );
  }

  if (options?.additionalProperties) {
    schema.apply(
      objectBuilder({
        additionalProperties: options.additionalProperties?.toSchema(),
      }),
    );
  }

  if (options?.defs) {
    for (const def of options.defs) {
      schema.apply(def as SchemaBuilder<ObjectSchema>);
    }
  }

  return schema;
}

function properties(...props: Array<SchemaBuilder<ObjectSchema>>): SchemaBuilder<ObjectSchema> {
  const schema = new SchemaBuilder<ObjectSchema>({} as ObjectSchema);

  for (const property of props) {
    schema.apply(property);
  }

  return schema;
}

type RequiredPropertyOptions = {
  dependentSchema?: SchemaBuilder<ObjectSchema>;
};

function requiredProperty(
  name: string,
  schema: SchemaBuilder<Schema>,
  options?: RequiredPropertyOptions,
): SchemaBuilder<ObjectSchema> {
  return objectBuilder(
    Object.assign(
      {
        properties: {
          [name]: schema.toSchema(),
        },
        required: [name],
      },
      options?.dependentSchema
        ? { dependentSchemas: { [name]: options.dependentSchema?.toSchema() } }
        : {},
    ),
  );
}

type OptionalPropertyOptions = RequiredPropertyOptions & {
  dependsOn?: string[];
};

function property(
  name: string,
  schema: SchemaBuilder<Schema>,
  options?: OptionalPropertyOptions,
): SchemaBuilder<ObjectSchema> {
  return objectBuilder(
    Object.assign(
      {
        properties: {
          [name]: schema.toSchema(),
        },
      },
      options?.dependsOn ? { dependentRequired: { [name]: options.dependsOn } } : {},
      options?.dependentSchema
        ? { dependentSchemas: { [name]: options.dependentSchema?.toSchema() } }
        : {},
    ),
  );
}

function patternProperty(
  pattern: string,
  schema: SchemaBuilder<Schema>,
): SchemaBuilder<ObjectSchema> {
  return objectBuilder({
    patternProperties: {
      [pattern]: schema.toSchema(),
    },
  });
}

const arrayBuilder = (schema: Partial<ArraySchema>): SchemaBuilder<ArraySchema> =>
  new SchemaBuilder<ArraySchema>({
    ...schema,
  } as ArraySchema);

type ArrayOptions = {
  items?: SchemaBuilder<Schema> | boolean;
  prefixItems?: Array<SchemaBuilder<Schema>>;
  unevaluatedItems?: SchemaBuilder<Schema> | boolean;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  contains?: { schema: SchemaBuilder<Schema>; max?: number; min?: number };
  defs?: Array<SchemaBuilder<Schema>>;
} & AnnotationSchema;

function array(options?: ArrayOptions): SchemaBuilder<ArraySchema> {
  const additionalOptions = omit(options, [
    "items",
    "prefixItems",
    "unevaluatedItems",
    "contains",
    "defs",
  ]) as Omit<ArraySchema, "type">;

  const schema = new SchemaBuilder<ArraySchema>({
    type: "array",
    ...additionalOptions,
  });

  const items = options?.items;

  if (typeof items !== "undefined") {
    if (typeof items === "boolean") {
      schema.apply(
        arrayBuilder({
          items,
        }),
      );
    } else {
      schema.apply(arrayBuilder({ items: items.toSchema() }));
    }
  }

  if (options?.prefixItems) {
    for (const item of options.prefixItems) {
      schema.apply(arrayBuilder({ prefixItems: [item.toSchema()] }));
    }
  }

  const unevaluatedItems = options?.unevaluatedItems;

  if (typeof unevaluatedItems !== "undefined") {
    if (typeof unevaluatedItems === "boolean") {
      schema.apply(
        arrayBuilder({
          unevaluatedItems,
        }),
      );
    } else {
      schema.apply(arrayBuilder({ unevaluatedItems: unevaluatedItems.toSchema() }));
    }
  }

  if (options?.contains) {
    schema.apply(
      arrayBuilder({
        contains: options.contains.schema.toSchema(),
        minContains: options.contains.min,
        maxContains: options.contains.max,
      }),
    );
  }

  if (options?.defs) {
    for (const def of options.defs) {
      schema.apply(def as SchemaBuilder<ArraySchema>);
    }
  }

  return schema;
}

function string(options?: Omit<StringSchema, "type">): SchemaBuilder<StringSchema> {
  return new SchemaBuilder({
    type: "string",
    ...options,
  });
}

function integer(options?: Omit<IntSchema, "type">): SchemaBuilder<IntSchema> {
  return new SchemaBuilder({
    type: "integer",
    ...options,
  });
}

function number(options?: Omit<NumberSchema, "type">): SchemaBuilder<NumberSchema> {
  return new SchemaBuilder({
    type: "number",
    ...options,
  });
}

function nil(options?: Omit<NullSchema, "type">): SchemaBuilder<NullSchema> {
  return new SchemaBuilder({
    type: "null",
    ...options,
  });
}

function boolean(options?: Omit<BooleanSchema, "type">): SchemaBuilder<BooleanSchema> {
  return new SchemaBuilder({
    type: "boolean",
    ...options,
  });
}

function nullable(schema: SchemaBuilder<Schema>): SchemaBuilder<Schema> {
  const nullableSchema = schema.toSchema();

  if (
    typeof nullableSchema === "boolean" ||
    nullableSchema.type === "null" ||
    typeof nullableSchema.type === "undefined"
  ) {
    return schema;
  }

  const type = Array.isArray(nullableSchema.type)
    ? nullableSchema.type.concat(<const>"null")
    : [nullableSchema.type, <const>"null"];

  return new SchemaBuilder({
    ...nullableSchema,
    type,
  });
}

function anyOf(...schemas: SchemaBuilder<Schema>[]): SchemaBuilder<Schema> {
  return new SchemaBuilder({
    anyOf: schemas.map((s) => s.toSchema()),
  });
}

function allOf(...schemas: SchemaBuilder<Schema>[]): SchemaBuilder<Schema> {
  return new SchemaBuilder({
    allOf: schemas.map((s) => s.toSchema()),
  });
}

function oneOf(...schemas: SchemaBuilder<Schema>[]): SchemaBuilder<Schema> {
  return new SchemaBuilder({
    oneOf: schemas.map((s) => s.toSchema()),
  });
}

function not(schema: SchemaBuilder<Schema>): SchemaBuilder<Schema> {
  return new SchemaBuilder({
    not: schema.toSchema(),
  });
}

function ifThenElse(
  condition: SchemaBuilder<Schema>,
  then: SchemaBuilder<Schema>,
  thenElse: SchemaBuilder<Schema>,
): SchemaBuilder<Schema> {
  return new SchemaBuilder({
    if: condition.toSchema(),
    then: then.toSchema(),
    else: thenElse.toSchema(),
  });
}

function ifThen(
  condition: SchemaBuilder<Schema>,
  then: SchemaBuilder<Schema>,
): SchemaBuilder<Schema> {
  return new SchemaBuilder({
    if: condition.toSchema(),
    then: then.toSchema(),
  });
}

function def(name: string, schema: SchemaBuilder<Schema>): SchemaBuilder<Schema> {
  return new SchemaBuilder({
    $defs: {
      [name]: schema.toSchema(),
    },
  });
}

function ref(def: string): SchemaBuilder<Schema> {
  return new SchemaBuilder({
    $ref: `#/$defs/${def}`,
  });
}

function constant(value: any): SchemaBuilder<Schema> {
  return new SchemaBuilder({
    const: value,
  });
}

function enumerator(...values: any[]): SchemaBuilder<Schema> {
  return new SchemaBuilder({
    enum: values,
  });
}

function $false(): SchemaBuilder<Schema> {
  return new SchemaBuilder(false);
}

function $true(): SchemaBuilder<Schema> {
  return new SchemaBuilder(true);
}

export const s = {
  object,
  properties,
  requiredProperty,
  property,
  patternProperty,
  array,
  string,
  integer,
  number,
  nil,
  boolean,
  nullable,
  anyOf,
  allOf,
  oneOf,
  not,
  ifThenElse,
  ifThen,
  def,
  ref,
  constant,
  enumerator,
  $false,
  $true,
};
