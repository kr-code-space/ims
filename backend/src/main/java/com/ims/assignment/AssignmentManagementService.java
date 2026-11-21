package com.ims.assignment;

import com.ims.academic.AcademicClass;
import com.ims.academic.AcademicClassRepository;
import com.ims.academic.EnrolmentRepository;
import com.ims.academic.Subject;
import com.ims.academic.SubjectOfferingRepository;
import com.ims.academic.SubjectRepository;
import com.ims.faculty.Faculty;
import com.ims.faculty.FacultyRepository;
import com.ims.student.Student;
import com.ims.student.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class AssignmentManagementService {
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final SubjectRepository subjectRepository;
    private final AcademicClassRepository classRepository;
    private final SubjectOfferingRepository offeringRepository;
    private final EnrolmentRepository enrolmentRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;

    public AssignmentManagementService(AssignmentRepository assignmentRepository,
                                       SubmissionRepository submissionRepository,
                                       SubjectRepository subjectRepository,
                                       AcademicClassRepository classRepository,
                                       SubjectOfferingRepository offeringRepository,
                                       EnrolmentRepository enrolmentRepository,
                                       FacultyRepository facultyRepository,
                                       StudentRepository studentRepository) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.subjectRepository = subjectRepository;
        this.classRepository = classRepository;
        this.offeringRepository = offeringRepository;
        this.enrolmentRepository = enrolmentRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public AssignmentDtos.AssignmentResponse create(String username, AssignmentDtos.CreateRequest request) {
        validateFacultyAccess(username, request.academicClassId(), request.subjectId());
        Subject subject = subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> notFound("Subject not found"));
        AcademicClass academicClass = classRepository.findById(request.academicClassId())
                .orElseThrow(() -> notFound("Academic class not found"));
        if (request.dueDate().isBefore(java.time.LocalDate.now())) {
            throw badRequest("Due date cannot be in the past");
        }
        if (request.maxMarks() < 1) throw badRequest("Maximum marks must be at least 1");

        Assignment assignment = new Assignment();
        assignment.setTitle(request.title().trim());
        assignment.setDescription(request.description());
        assignment.setSubject(subject);
        assignment.setAcademicClass(academicClass);
        assignment.setDueDate(request.dueDate());
        assignment.setMaxMarks(request.maxMarks());
        return AssignmentDtos.AssignmentResponse.from(assignmentRepository.save(assignment));
    }

    @Transactional(readOnly = true)
    public List<AssignmentDtos.AssignmentResponse> facultyAssignments(String username) {
        Faculty faculty = facultyRepository.findByUserUsername(username)
                .orElseThrow(() -> notFound("Faculty record not found"));
        Map<Long, AssignmentDtos.AssignmentResponse> assignments = new LinkedHashMap<>();
        offeringRepository.findByFacultyIdAndActiveTrue(faculty.getId()).forEach(offering ->
                assignmentRepository.findByAcademicClassIdOrderByDueDateAsc(offering.getAcademicClass().getId())
                        .stream()
                        .filter(assignment -> assignment.getSubject().getId().equals(offering.getSubject().getId()))
                        .forEach(assignment -> assignments.put(
                                assignment.getId(),
                                AssignmentDtos.AssignmentResponse.from(assignment))));
        return assignments.values().stream().toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentDtos.AssignmentResponse> studentAssignments(String username) {
        Student student = studentRepository.findByUserUsername(username)
                .orElseThrow(() -> notFound("Student record not found"));
        Map<Long, AssignmentDtos.AssignmentResponse> assignments = new LinkedHashMap<>();
        enrolmentRepository.findByStudentIdAndActiveTrue(student.getId()).forEach(enrolment ->
                assignmentRepository.findByAcademicClassIdOrderByDueDateAsc(enrolment.getAcademicClass().getId())
                        .forEach(assignment -> assignments.put(
                                assignment.getId(),
                                AssignmentDtos.AssignmentResponse.from(assignment))));
        return assignments.values().stream().toList();
    }

    @Transactional
    public AssignmentDtos.SubmissionResponse submit(String username, AssignmentDtos.SubmitRequest request) {
        Student student = studentRepository.findByUserUsername(username)
                .orElseThrow(() -> notFound("Student record not found"));
        Assignment assignment = assignmentRepository.findById(request.assignmentId())
                .orElseThrow(() -> notFound("Assignment not found"));
        if (assignment.getAcademicClass() == null ||
                enrolmentRepository.findByStudentIdAndActiveTrue(student.getId()).stream()
                        .noneMatch(enrolment -> enrolment.getAcademicClass().getId()
                                .equals(assignment.getAcademicClass().getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You are not enrolled in the class for this assignment");
        }

        Submission submission = submissionRepository
                .findByAssignmentIdAndStudentId(assignment.getId(), student.getId())
                .orElseGet(Submission::new);
        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setSubmittedText(request.submittedText());
        submission.setStatus("SUBMITTED");
        submission.setMarks(0);
        submission.setFeedback(null);
        return AssignmentDtos.SubmissionResponse.from(submissionRepository.save(submission));
    }

    @Transactional(readOnly = true)
    public List<AssignmentDtos.SubmissionResponse> studentSubmissions(String username) {
        Student student = studentRepository.findByUserUsername(username)
                .orElseThrow(() -> notFound("Student record not found"));
        return submissionRepository.findByStudentIdOrderBySubmittedAtDesc(student.getId()).stream()
                .map(AssignmentDtos.SubmissionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentDtos.SubmissionResponse> facultySubmissions(String username, Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> notFound("Assignment not found"));
        validateFacultyAccess(username, assignment.getAcademicClass().getId(), assignment.getSubject().getId());
        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(AssignmentDtos.SubmissionResponse::from)
                .toList();
    }

    @Transactional
    public AssignmentDtos.SubmissionResponse evaluate(String username, Long submissionId,
                                                       AssignmentDtos.EvaluateRequest request) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> notFound("Submission not found"));
        Assignment assignment = submission.getAssignment();
        validateFacultyAccess(username, assignment.getAcademicClass().getId(), assignment.getSubject().getId());
        if (request.marks() < 0 || request.marks() > assignment.getMaxMarks()) {
            throw badRequest("Marks must be between 0 and " + assignment.getMaxMarks());
        }
        submission.setMarks(request.marks());
        submission.setFeedback(request.feedback());
        submission.setStatus("EVALUATED");
        return AssignmentDtos.SubmissionResponse.from(submissionRepository.save(submission));
    }

    private void validateFacultyAccess(String username, Long classId, Long subjectId) {
        Faculty faculty = facultyRepository.findByUserUsername(username)
                .orElseThrow(() -> notFound("Faculty record not found"));
        boolean assigned = offeringRepository.findByFacultyIdAndActiveTrue(faculty.getId()).stream()
                .anyMatch(offering -> offering.getAcademicClass().getId().equals(classId)
                        && offering.getSubject().getId().equals(subjectId));
        if (!assigned) throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                "You are not assigned to this class and subject");
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }
}
