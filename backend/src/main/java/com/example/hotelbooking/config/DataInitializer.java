package com.example.hotelbooking.config;

import com.example.hotelbooking.user.Role;
import com.example.hotelbooking.user.User;
import com.example.hotelbooking.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Bootstrap Default Admin Account if not present
        if (!userRepository.existsByEmail("admin@example.com")) {
            User admin = new User(
                    "System Administrator",
                    "admin@example.com",
                    passwordEncoder.encode("Admin123!"),
                    Role.ADMIN
            );
            userRepository.save(admin);
            log.info("Initialized default operational ADMIN account: admin@example.com");
        }

        // Bootstrap Demo Customer Account if not present
        if (!userRepository.existsByEmail("customer@example.com")) {
            User customer = new User(
                    "Alex Johnson",
                    "customer@example.com",
                    passwordEncoder.encode("Password123!"),
                    Role.CUSTOMER
            );
            userRepository.save(customer);
            log.info("Initialized default demo CUSTOMER account: customer@example.com");
        }
    }
}
