export interface EmailPasswordAuthOptions {
  email: string;
  password: string;
}

export interface ApiKeyAuthOptions {
  apiKey: string;
}

export interface CustomJwtAuthOptions {
  jwtTokenString: string;
}

export type AuthOptions =
  | EmailPasswordAuthOptions
  | ApiKeyAuthOptions
  | CustomJwtAuthOptions;
