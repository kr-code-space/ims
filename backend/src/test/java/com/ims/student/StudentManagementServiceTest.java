package com.ims.student;

import com.ims.user.UserEntity;
import com.ims.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudentManagementServiceTest {
    @Mock
    private StudentRepository studentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private StudentManagementService service;

    @Test
    void createsStudentAndHashesOptionalLoginPassword() {
        when(studentRepository.existsByStudentNumber("S-100")).thenReturn(false);
        when(userRepository.existsByUsername("student100")).thenReturn(false);
        when(passwordEncoder.encode("long-enough-password")).thenReturn("hashed-password");
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> {
            UserEntity user = invocation.getArgument(0);
            user.setId(8L);
            return user;
        });
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> {
            Student student = invocation.getArgument(0);
            student.setId(3L);
            return student;
        });

        StudentResponse response = service.create(new CreateStudentRequest(
                " S-100 ", "Ada", "Lovelace", "Computing", "1st year", "A",
                "student100", "long-enough-password", "ada@example.com"
        ));

        assertEquals(3L, response.id());
        assertEquals("S-100", response.studentNumber());
        assertEquals("student100", response.accountUsername());
        ArgumentCaptor<UserEntity> savedUser = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository).save(savedUser.capture());
        assertEquals("hashed-password", savedUser.getValue().getPassword());
        verify(passwordEncoder).encode("long-enough-password");
    }

    @Test
    void rejectsPartialLoginDetailsWithoutCreatingStudent() {
        when(studentRepository.existsByStudentNumber("S-101")).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> service.create(new CreateStudentRequest(
                "S-101", "Grace", "Hopper", "Computing", "1st year", "A",
                "student101", null, null
        )));

        verify(studentRepository, never()).save(any(Student.class));
        verify(userRepository, never()).save(any(UserEntity.class));
    }

    @Test
    void deactivatingStudentAlsoDisablesLinkedLogin() {
        UserEntity user = new UserEntity();
        user.setEnabled(true);
        Student student = new Student();
        student.setId(4L);
        student.setUser(user);
        when(studentRepository.findById(4L)).thenReturn(Optional.of(student));
        when(studentRepository.save(student)).thenReturn(student);

        StudentResponse response = service.updateStatus(4L, false);

        assertFalse(response.active());
        assertFalse(user.isEnabled());
    }
}
