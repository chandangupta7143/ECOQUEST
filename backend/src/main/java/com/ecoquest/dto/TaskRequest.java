package com.ecoquest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TaskRequest {
    private String title;
    private String description;
    private String category;
    private String type;
    private Integer xpReward;

    @JsonProperty("class")
    private String className;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getXpReward() { return xpReward; }
    public void setXpReward(Integer xpReward) { this.xpReward = xpReward; }
    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }
}
