import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return Response.redirect(new URL("/Alexander%20Skula%20Resume.pdf", request.url));
}