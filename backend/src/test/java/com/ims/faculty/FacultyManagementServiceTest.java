package com.ims.faculty;

import com.ims.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class FacultyManagementServiceTest {
    private final FacultyRepository facultyRepository = mock(FacultyRepository.class);
    private final UserRepository userRepository = mock(UserRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final FacultyManagementService service =
            new FacultyManagementService(facultyRepository, userRepository, passwordEncoder);

    @Test
    void createsFacultyRecordWithoutLogin() {
        var request = new FacultyDtos.CreateRequest(
                "EMP-001", "Ada", "Lovelace", "Computer Science", "Professor",
                null, null, null, false
        );
        when(facultyRepository.save(any(Faculty.class))).thenAnswer(invocation -> {
            Faculty faculty = invocation.getArgument(0);
            faculty.setId(1L);
            return faculty;
        });

        FacultyDtos.Response response = service.create(request);

        assertEquals("EMP-001", response.employeeNumber());
        assertEquals(null, response.accountUsername());
        verify(facultyRepository).save(any(Faculty.class));
    }

    @Test
    void rejectsIncompleteOptionalLoginDetails() {
        var request = new FacultyDtos.CreateRequest(
                "EMP-002", "Grace", "Hopper", "Computer Science", "Lecturer",
                "grace", null, null, false
        );

        ResponseStatusException error =
                assertThrows(ResponseStatusException.class, () -> service.create(request));
        assertEquals("Username, password, and email are all required to create a faculty login",
                error.getReason());
    }
}
