export type AccessState = {
  isAuthenticated: boolean;
  isReviewer: boolean;
  hasActiveMembership: boolean;
  onboardingCompleted: boolean;
};

export type MagicLinkState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: { email?: string[] } };

export const initialMagicLinkState: MagicLinkState = { status: "idle" };
