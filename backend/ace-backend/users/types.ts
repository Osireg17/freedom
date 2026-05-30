export interface GetUserParams {
  id: string;
}

export interface GetUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  subscriptionTier: string;
  createdAt: Date;
}
