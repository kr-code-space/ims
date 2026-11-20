package com.ims.controller;

import com.ims.user.CreateUserRequest;
import com.ims.user.CreatedUserResponse;
import com.ims.user.ResetUserPasswordRequest;
import com.ims.user.UpdateUserPermissionsRequest;
import com.ims.user.UpdateUserStatusRequest;
import com.ims.user.UserProvisioningService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {
    private final UserProvisioningService userProvisioningService;

    public AdminUserController(UserProvisioningService userProvisioningService) {
        this.userProvisioningService = userProvisioningService;
    }

    @GetMapping
    public List<CreatedUserResponse> findAll() {
        return userProvisioningService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreatedUserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        return userProvisioningService.createUser(request);
    }

    @PutMapping("/{userId}/status")
    public CreatedUserResponse updateStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserStatusRequest request,
            Authentication authentication
    ) {
        return userProvisioningService.updateStatus(userId, request.enabled(), authentication.getName());
    }

    @PutMapping("/{userId}/password")
    public CreatedUserResponse resetPassword(
            @PathVariable Long userId,
            @Valid @RequestBody ResetUserPasswordRequest request,
            Authentication authentication
    ) {
        return userProvisioningService.resetPassword(userId, request.password(), authentication.getName());
    }

    @PutMapping("/{userId}/permissions")
    public CreatedUserResponse updatePermissions(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserPermissionsRequest request
    ) {
        return userProvisioningService.updatePermissions(userId, request.permissions());
    }
}
