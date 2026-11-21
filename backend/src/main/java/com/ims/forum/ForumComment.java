package com.ims.forum;
import com.ims.student.Student;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="forum_comments")
public class ForumComment {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(optional=false) @JoinColumn(name="post_id") private ForumPost post;
    @ManyToOne(optional=false) @JoinColumn(name="student_id") private Student student;
    @Column(nullable=false,length=2000) private String content;
    @Column(nullable=false) private boolean anonymous;
    @Column(nullable=false) private LocalDateTime createdAt;

    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public ForumPost getPost(){return post;} public void setPost(ForumPost post){this.post=post;}
    public Student getStudent(){return student;} public void setStudent(Student student){this.student=student;}
    public String getContent(){return content;} public void setContent(String content){this.content=content;}
    public boolean isAnonymous(){return anonymous;} public void setAnonymous(boolean anonymous){this.anonymous=anonymous;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime createdAt){this.createdAt=createdAt;}
}
