package com.ims.user;

import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record UpdateUserPermissionsRequest(@NotNull Set<@NotNull UserPermission> permissions) {
}
