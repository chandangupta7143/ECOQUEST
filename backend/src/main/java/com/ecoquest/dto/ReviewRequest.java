package com.ecoquest.dto;

public class ReviewRequest {
    private Integer teacherScore;
    private String status;

    public Integer getTeacherScore() { return teacherScore; }
    public void setTeacherScore(Integer teacherScore) { this.teacherScore = teacherScore; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
