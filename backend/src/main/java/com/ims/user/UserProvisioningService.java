package com.ims.user;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@Service
public class UserProvisioningService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProvisioningService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public CreatedUserResponse createUser(CreateUserRequest request) {
        Set<UserPermission> permissions = request.permissions() == null ? Set.of() : request.permissions();
        validatePermissions(request.role(), permissions);

        if (userRepository.existsByUsername(request.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already in use");
        }

        UserEntity user = new UserEntity();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setPermissions(permissions);
        user.setEnabled(true);
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());

        return CreatedUserResponse.from(userRepository.save(user));
    }

    @Transactional
    public CreatedUserResponse updatePermissions(Long userId, Set<UserPermission> permissions) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        validatePermissions(user.getRole(), permissions);
        user.setPermissions(Set.copyOf(permissions));
        return CreatedUserResponse.from(userRepository.save(user));
    }

    private void validatePermissions(UserRole role, Set<UserPermission> permissions) {
        if (!permissions.isEmpty() && role != UserRole.FACULTY) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Additional permissions are currently only supported for faculty"
            );
        }
    }
}
