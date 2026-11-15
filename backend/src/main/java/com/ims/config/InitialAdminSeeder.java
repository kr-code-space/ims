package com.ims.config;

import com.ims.user.UserEntity;
import com.ims.user.UserRepository;
import com.ims.user.UserRole;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class InitialAdminSeeder implements ApplicationRunner {
    private static final Logger logger = LoggerFactory.getLogger(InitialAdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String password;
    private final String firstName;
    private final String lastName;
    private final String email;

    public InitialAdminSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${ims.bootstrap-admin.username:}") String username,
            @Value("${ims.bootstrap-admin.password:}") String password,
            @Value("${ims.bootstrap-admin.first-name:}") String firstName,
            @Value("${ims.bootstrap-admin.last-name:}") String lastName,
            @Value("${ims.bootstrap-admin.email:}") String email
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!StringUtils.hasText(username)
                || !StringUtils.hasText(password)
                || !StringUtils.hasText(firstName)
                || !StringUtils.hasText(lastName)
                || !StringUtils.hasText(email)) {
            logger.warn("No initial admin was created; configure all IMS_BOOTSTRAP_ADMIN_* variables to provision one.");
            return;
        }

        if (password.length() < 12 || password.length() > 72) {
            throw new IllegalStateException("IMS_BOOTSTRAP_ADMIN_PASSWORD must be between 12 and 72 characters.");
        }

        if (userRepository.existsByUsername(username)) {
            return;
        }

        UserEntity admin = new UserEntity();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole(UserRole.ADMIN);
        admin.setEnabled(true);
        admin.setFirstName(firstName);
        admin.setLastName(lastName);
        admin.setEmail(email);
        userRepository.save(admin);
        logger.info("Created initial administrator account '{}'.", username);
    }
}
