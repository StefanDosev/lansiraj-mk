export type OnboardingValues = {
  displayName: string;
  projectTitle: string;
  targetUser: string;
  problemStatement: string;
  coreAction: string;
  nonFeatures: string;
  weeklyHours: string;
  targetLaunchDate: string;
};

export type OnboardingField = keyof OnboardingValues;

export type OnboardingState =
  | { status: "idle"; values: OnboardingValues }
  | {
      status: "error";
      message: string;
      values: OnboardingValues;
      fieldErrors?: Partial<Record<OnboardingField, string[]>>;
    };
