import { NextResponse } from "next/server";
import { getRequestId } from "@/lib/logger";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "RATE_LIMITED"
  | "SERVICE_ERROR"
  | "AI_ERROR"
  | "VALIDATION_ERROR";

export function errorResponse(
  message: string,
  status: number,
  code: ApiErrorCode = "SERVICE_ERROR",
  details?: unknown,
  req?: unknown
) {
  const requestId = getRequestId(req as never);
  return NextResponse.json(
    {
      error: message,
      code,
      requestId,
      ...(details !== undefined ? { details } : {}),
    },
    { status, headers: { "x-request-id": requestId } }
  );
}

export function successResponse<T>(data: T, req?: unknown, init?: { status?: number }) {
  const requestId = getRequestId(req as never);
  return NextResponse.json(data as never, {
    status: init?.status ?? 200,
    headers: { "x-request-id": requestId },
  });
}
