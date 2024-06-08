import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://127.0.0.1:3000/graphql",
  documents: ["app/**/*.{ts,tsx}"],
  config: {
    scalars: {
      ISO8601DateTime: "Date",
    },
  },
  ignoreNoDocuments: true,
  generates: {
    "./app/graphql/": {
      preset: "client",
      config: {
        useTypeImports: true,
        avoidOptionals: true,
      },
    },
  },
};

export default config;
