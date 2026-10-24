package com.example.hotelbooking.auth;

import com.example.hotelbooking.common.ConflictException;
import com.example.hotelbooking.common.ForbiddenException;
import com.example.hotelbooking.config.JwtService;
import com.example.hotelbooking.user.Role;
import com.example.hotelbooking.user.User;
import com.example.hotelbooking.user.UserRepository;
import com.example.hotelbooking.user.UserResponseDto;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ConflictException("Email address is already registered");
        }

        // Public registration always assigns CUSTOMER role
        User user = new User(
                request.getFullName().trim(),
                normalizedEmail,
                passwordEncoder.encode(request.getPassword()),
                Role.CUSTOMER
        );

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        return new AuthResponseDto(
                token,
                jwtService.getExpirationMs(),
                UserResponseDto.from(savedUser)
        );
    }

    @Transactional(readOnly = true)
    public AuthResponseDto login(LoginRequestDto request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.isEnabled()) {
            throw new ForbiddenException("Account has been disabled");
        }

        String token = jwtService.generateToken(user);

        return new AuthResponseDto(
                token,
                jwtService.getExpirationMs(),
                UserResponseDto.from(user)
        );
    }

    public UserResponseDto getCurrentUserProfile(User user) {
        return UserResponseDto.from(user);
    }
}
