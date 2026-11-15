package com.ims.user;

import java.util.List;

public enum UserRole {
    ADMIN,
    FACULTY,
    STUDENT,
    LIBRARIAN;

    public List<String> authorities() {
        return switch (this) {
            case ADMIN -> List.of("ROLE_ADMIN", "READ_ALL", "WRITE_ALL");
            case FACULTY -> List.of("ROLE_FACULTY", "COURSE_VIEW", "ATTENDANCE_MANAGE");
            case STUDENT -> List.of("ROLE_STUDENT", "PROFILE_VIEW", "ASSIGNMENT_SUBMIT", "FEE_VIEW");
            case LIBRARIAN -> List.of("ROLE_LIBRARIAN", "BOOK_MANAGE", "CIRCULATION_VIEW");
        };
    }
}
