package com.ims.forum;
import com.ims.academic.AcademicClass;
import com.ims.student.Student;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="forum_posts")
public class ForumPost {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) @JoinColumn(name="academic_class_id") private AcademicClass academicClass;
    @ManyToOne(optional=false) @JoinColumn(name="student_id") private Student student;
    @Column(nullable=false) private String title;
    @Column(nullable=false,length=4000) private String content;
    @Column(nullable=false) private boolean anonymous;
    @Column(nullable=false) private LocalDateTime createdAt;

    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public AcademicClass getAcademicClass(){return academicClass;} public void setAcademicClass(AcademicClass academicClass){this.academicClass=academicClass;}
    public Student getStudent(){return student;} public void setStudent(Student student){this.student=student;}
    public String getTitle(){return title;} public void setTitle(String title){this.title=title;}
    public String getContent(){return content;} public void setContent(String content){this.content=content;}
    public boolean isAnonymous(){return anonymous;} public void setAnonymous(boolean anonymous){this.anonymous=anonymous;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime createdAt){this.createdAt=createdAt;}
}
