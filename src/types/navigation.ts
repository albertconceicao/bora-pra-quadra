export type RootStackParamList = {
  Home: undefined;
  SignIn: undefined;
  SignUp: undefined;
  Courts: { userOnly?: boolean };
  CourtDetails: { courtId: string };
  Affiliations: undefined;
  ManageAffiliations: { courtId: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 