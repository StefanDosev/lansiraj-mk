type AuthRequestFailure = {
  status?: number;
};

export function isAuthRateLimitFailure(error: AuthRequestFailure) {
  return error.status === 429;
}
