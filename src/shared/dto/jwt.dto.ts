export interface AccessTokenDto {
  userId: string
  email: string
  deviceId: string
}

export interface RefreshTokenDto {
  userId: string
  email: string
}