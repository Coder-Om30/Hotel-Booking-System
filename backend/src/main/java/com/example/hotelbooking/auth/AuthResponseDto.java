package com.example.hotelbooking.auth;

import com.example.hotelbooking.user.UserResponseDto;

public class AuthResponseDto {
    private String accessToken;
    private String tokenType = "Bearer";
    private long expiresInMs;
    private UserResponseDto user;

    public AuthResponseDto() {}

    public AuthResponseDto(String accessToken, long expiresInMs, UserResponseDto user) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.expiresInMs = expiresInMs;
        this.user = user;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public long getExpiresInMs() { return expiresInMs; }
    public void setExpiresInMs(long expiresInMs) { this.expiresInMs = expiresInMs; }

    public UserResponseDto getUser() { return user; }
    public void setUser(UserResponseDto user) { this.user = user; }
}
