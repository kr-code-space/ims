package com.ims.user;

import java.util.Set;

public record CreatedUserResponse(
        Long id,
        String username,
        UserRole role,
        Set<UserPermission> permissions,
        boolean enabled,
        String firstName,
        String lastName,
        String email
) {
    public static CreatedUserResponse from(UserEntity user) {
        return new CreatedUserResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                Set.copyOf(user.getPermissions()),
                user.isEnabled(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail()
        );
    }
}
