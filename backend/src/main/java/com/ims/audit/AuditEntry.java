package com.ims.audit;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="audit_entries")
public class AuditEntry {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String actor;
    @Column(nullable=false) private String action;
    @Column(nullable=false) private String entityType;
    private String entityId;
    @Column(length=4000) private String details;
    @Column(nullable=false) private LocalDateTime occurredAt;

    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getActor(){return actor;} public void setActor(String actor){this.actor=actor;}
    public String getAction(){return action;} public void setAction(String action){this.action=action;}
    public String getEntityType(){return entityType;} public void setEntityType(String entityType){this.entityType=entityType;}
    public String getEntityId(){return entityId;} public void setEntityId(String entityId){this.entityId=entityId;}
    public String getDetails(){return details;} public void setDetails(String details){this.details=details;}
    public LocalDateTime getOccurredAt(){return occurredAt;} public void setOccurredAt(LocalDateTime occurredAt){this.occurredAt=occurredAt;}
}
