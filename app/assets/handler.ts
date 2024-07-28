export async function handleAssetRoutes(url: string): Promise<Response> {
  const { pathname } = new URL(url);
  if (pathname.startsWith("/assets/images/students")) {
    const matches = pathname.match(/^\/assets\/images\/students\/(?<studentId>\S+)$/);
    console.log(matches);
    if (matches?.groups?.studentId) {
      const { studentId } = matches.groups;
      if (studentId === "unlisted") {
        return proxy("https://assets.mollulog.net/assets/images/students/-1");
      } else {
        return proxy(`https://raw.githubusercontent.com/SchaleDB/SchaleDB/main/images/student/collection/${studentId}.webp`);
      }
    }
  }

  return new Response(null, { status: 404 });
}

async function proxy(url: string): Promise<Response> {
  const proxyResponse = await fetch(new Request(url));
  if (proxyResponse.status !== 200) {
    return new Response(null, { status: 404 });
  }

  const response = new Response(proxyResponse.body, proxyResponse);
  response.headers.set("Cache-Control", "public, max-age=604800");
  return response;
}
