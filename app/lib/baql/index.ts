import type { TypedDocumentNode, AnyVariables, OperationResult } from "urql";
import { createClient, cacheExchange, fetchExchange, debugExchange } from "urql";
import { requestPolicyExchange } from "@urql/exchange-request-policy";
import type { DocumentNode } from "graphql/language";

const URL = "http://127.0.0.1:3000/graphql";

export const client = createClient({
  url: URL,
  exchanges: [
    debugExchange,
    requestPolicyExchange({ ttl: 60_000, shouldUpgrade: () => true }),
    cacheExchange,
    fetchExchange,
  ],
});

export async function runQuery<Data = any, Variables extends AnyVariables = AnyVariables>(
  query: DocumentNode | TypedDocumentNode<Data, Variables> | string,
  variables: Variables,
): Promise<OperationResult<Data, Variables>> {
  return client.query<Data, Variables>(query, variables).toPromise();
}
