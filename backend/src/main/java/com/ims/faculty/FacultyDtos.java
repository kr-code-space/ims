package com.ims.faculty;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FacultyDtos {
    public record CreateRequest(
            @NotBlank @Size(max = 100) String employeeNumber,
            @NotBlank @Size(max = 100) String firstName,
            @NotBlank @Size(max = 100) String lastName,
            @NotBlank @Size(max = 150) String department,
            @NotBlank @Size(max = 150) String designation,
            @Size(max = 255) String username,
            @Size(min = 12, max = 72) String password,
            @Email @Size(max = 255) String email,
            Boolean labAccess
    ) {}

    public record UpdateRequest(
            @NotBlank @Size(max = 100) String employeeNumber,
            @NotBlank @Size(max = 100) String firstName,
            @NotBlank @Size(max = 100) String lastName,
            @NotBlank @Size(max = 150) String department,
            @NotBlank @Size(max = 150) String designation
    ) {}

    public record StatusRequest(Boolean active) {}

    public record Response(Long id, String employeeNumber, String firstName, String lastName,
                           String department, String designation, boolean active,
                           String accountUsername, String accountEmail, boolean labAccess) {
        public static Response from(Faculty faculty) {
            var user = faculty.getUser();
            return new Response(
                    faculty.getId(),
                    faculty.getEmployeeNumber(),
                    faculty.getFirstName(),
                    faculty.getLastName(),
                    faculty.getDepartment(),
                    faculty.getDesignation(),
                    faculty.isActive(),
                    user == null ? null : user.getUsername(),
                    user == null ? null : user.getEmail(),
                    user != null && user.getPermissions().stream().anyMatch(permission ->
                            permission.name().equals("LAB_ACCESS"))
            );
        }
    }
}
