package com.ims.laboratory;
import jakarta.persistence.*;

@Entity
@Table(name="lab_equipment")
public class LabEquipment {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String name;
    @Column(nullable=false) private String serialNumber;
    @Column(nullable=false) private String status = "AVAILABLE";
    private String maintenanceNotes;

    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getName(){return name;} public void setName(String name){this.name=name;}
    public String getSerialNumber(){return serialNumber;} public void setSerialNumber(String serialNumber){this.serialNumber=serialNumber;}
    public String getStatus(){return status;} public void setStatus(String status){this.status=status;}
    public String getMaintenanceNotes(){return maintenanceNotes;} public void setMaintenanceNotes(String maintenanceNotes){this.maintenanceNotes=maintenanceNotes;}
}
