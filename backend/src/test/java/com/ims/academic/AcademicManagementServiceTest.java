package com.ims.academic;

import com.ims.faculty.FacultyRepository;
import com.ims.student.StudentRepository;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AcademicManagementServiceTest {
    private final DepartmentRepository departmentRepository = mock(DepartmentRepository.class);
    private final AcademicTermRepository termRepository = mock(AcademicTermRepository.class);
    private final AcademicClassRepository classRepository = mock(AcademicClassRepository.class);
    private final SubjectRepository subjectRepository = mock(SubjectRepository.class);
    private final EnrolmentRepository enrolmentRepository = mock(EnrolmentRepository.class);
    private final SubjectOfferingRepository offeringRepository = mock(SubjectOfferingRepository.class);
    private final StudentRepository studentRepository = mock(StudentRepository.class);
    private final FacultyRepository facultyRepository = mock(FacultyRepository.class);

    private final AcademicManagementService service = new AcademicManagementService(
            departmentRepository,
            termRepository,
            classRepository,
            subjectRepository,
            enrolmentRepository,
            offeringRepository,
            studentRepository,
            facultyRepository
    );

    @Test
    void rejectsTermWithInvalidDateRange() {
        var request = new AcademicDtos.TermRequest(
                "Fall 2026",
                LocalDate.of(2026, 12, 1),
                LocalDate.of(2026, 11, 1),
                true
        );

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.createTerm(request)
        );

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
    }

    @Test
    void createsTermAndPersistsIt() {
        var request = new AcademicDtos.TermRequest(
                "Fall 2026",
                LocalDate.of(2026, 8, 1),
                LocalDate.of(2026, 12, 1),
                true
        );
        when(termRepository.existsByName("Fall 2026")).thenReturn(false);
        when(termRepository.save(any(AcademicTerm.class))).thenAnswer(invocation -> {
            AcademicTerm term = invocation.getArgument(0);
            term.setId(1L);
            return term;
        });

        AcademicDtos.TermResponse response = service.createTerm(request);

        assertEquals("Fall 2026", response.name());
        verify(termRepository).save(any(AcademicTerm.class));
    }
}
