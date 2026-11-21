package com.ims.controller;

import com.ims.attendance.AttendanceDtos;
import com.ims.attendance.AttendanceManagementService;
import com.ims.assignment.AssignmentDtos;
import com.ims.assignment.AssignmentManagementService;
import com.ims.fee.FeeDtos;
import com.ims.fee.FeeManagementService;
import com.ims.student.StudentResponse;
import com.ims.student.StudentRepository;
import com.ims.forum.ForumPost;
import com.ims.forum.ForumPostRepository;
import com.ims.forum.ForumComment;
import com.ims.forum.ForumCommentRepository;
import com.ims.academic.AcademicClassRepository;
import com.ims.academic.EnrolmentRepository;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {
    private final AttendanceManagementService attendanceService;
    private final AssignmentManagementService assignmentService;
    private final FeeManagementService feeService;
    private final StudentRepository studentRepository;
    private final ForumPostRepository forumPostRepository;
    private final ForumCommentRepository forumCommentRepository;
    private final AcademicClassRepository academicClassRepository;
    private final EnrolmentRepository enrolmentRepository;

    public StudentController(AttendanceManagementService attendanceService,
                             AssignmentManagementService assignmentService,
                             FeeManagementService feeService,
                             StudentRepository studentRepository,
                             ForumPostRepository forumPostRepository,
                             ForumCommentRepository forumCommentRepository,
                             AcademicClassRepository academicClassRepository,
                             EnrolmentRepository enrolmentRepository) {
        this.attendanceService = attendanceService;
        this.assignmentService = assignmentService;
        this.feeService = feeService;
        this.studentRepository = studentRepository;
        this.forumPostRepository = forumPostRepository;
        this.forumCommentRepository = forumCommentRepository;
        this.academicClassRepository = academicClassRepository;
        this.enrolmentRepository = enrolmentRepository;
    }

    @GetMapping("/overview")
    public Map<String, Object> overview() {
        return Map.of(
                "title", "Student Dashboard",
                "summary", "View academic records, assignments, attendance, and fees.",
                "dataStatus", "Module metrics will be available when their database workflows are implemented."
        );
    }

    @GetMapping("/attendance")
    public List<AttendanceDtos.RecordResponse> attendance(Authentication authentication) {
        return attendanceService.studentRecords(authentication.getName());
    }

    @GetMapping("/assignments")
    public List<AssignmentDtos.AssignmentResponse> assignments(Authentication authentication) {
        return assignmentService.studentAssignments(authentication.getName());
    }

    @GetMapping("/assignments/submissions")
    public List<AssignmentDtos.SubmissionResponse> submissions(Authentication authentication) {
        return assignmentService.studentSubmissions(authentication.getName());
    }

    @PostMapping("/assignments/submit")
    public AssignmentDtos.SubmissionResponse submit(
            Authentication authentication,
            @Valid @RequestBody AssignmentDtos.SubmitRequest request
    ) {
        return assignmentService.submit(authentication.getName(), request);
    }

    @GetMapping("/fees")
    public List<FeeDtos.Response> fees(Authentication authentication) {
        return feeService.studentFees(authentication.getName());
    }

    @GetMapping("/profile")
    public StudentResponse profile(Authentication authentication) {
        var student = studentRepository.findByUserUsername(authentication.getName())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Student record not found"));
        return StudentResponse.from(student);
    }

    @GetMapping("/classes")
    public java.util.List<com.ims.academic.AcademicDtos.ClassResponse> classes(Authentication authentication) {
        var student = studentRepository.findByUserUsername(authentication.getName())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Student record not found"));
        return enrolmentRepository.findByStudentIdAndActiveTrue(student.getId()).stream()
                .map(enrolment -> com.ims.academic.AcademicDtos.ClassResponse.from(enrolment.getAcademicClass()))
                .toList();
    }

    public record ForumPostRequest(Long academicClassId, String title, String content, boolean anonymous) {}
    public record ForumCommentRequest(Long postId, String content, boolean anonymous) {}

    @GetMapping("/forum")
    public java.util.List<ForumPost> forum(@RequestParam Long academicClassId) {
        return forumPostRepository.findByAcademicClassIdOrderByCreatedAtDesc(academicClassId);
    }

    @PostMapping("/forum/posts")
    public ForumPost createForumPost(Authentication authentication, @RequestBody ForumPostRequest request) {
        var student = studentRepository.findByUserUsername(authentication.getName())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Student record not found"));
        var academicClass = academicClassRepository.findById(request.academicClassId())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Academic class not found"));
        ForumPost post = new ForumPost();
        post.setStudent(student);
        post.setAcademicClass(academicClass);
        post.setTitle(request.title());
        post.setContent(request.content());
        post.setAnonymous(request.anonymous());
        post.setCreatedAt(java.time.LocalDateTime.now());
        return forumPostRepository.save(post);
    }

    @GetMapping("/forum/posts/{postId}/comments")
    public java.util.List<ForumComment> forumComments(@PathVariable Long postId) {
        return forumCommentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }

    @PostMapping("/forum/comments")
    public ForumComment createForumComment(Authentication authentication, @RequestBody ForumCommentRequest request) {
        var student = studentRepository.findByUserUsername(authentication.getName())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Student record not found"));
        var post = forumPostRepository.findById(request.postId())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Forum post not found"));
        ForumComment comment = new ForumComment();
        comment.setStudent(student);
        comment.setPost(post);
        comment.setContent(request.content());
        comment.setAnonymous(request.anonymous());
        comment.setCreatedAt(java.time.LocalDateTime.now());
        return forumCommentRepository.save(comment);
    }

    @DeleteMapping("/forum/posts/{postId}")
    public void deleteForumPost(Authentication authentication, @PathVariable Long postId) {
        var student = studentRepository.findByUserUsername(authentication.getName())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Student record not found"));
        var post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Forum post not found"));
        var cr = post.getAcademicClass().getCrStudent();
        if (cr == null || !cr.getId().equals(student.getId())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Only the assigned class representative can moderate this forum");
        }
        forumCommentRepository.deleteAll(forumCommentRepository.findByPostIdOrderByCreatedAtAsc(postId));
        forumPostRepository.delete(post);
    }
}
