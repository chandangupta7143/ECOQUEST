package com.ecoquest.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class QuizRequest {
    private String title;
    private String subject;
    private String chapter;
    private Integer xpReward;
    private List<QuestionDto> questions;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getChapter() { return chapter; }
    public void setChapter(String chapter) { this.chapter = chapter; }
    public Integer getXpReward() { return xpReward; }
    public void setXpReward(Integer xpReward) { this.xpReward = xpReward; }
    public List<QuestionDto> getQuestions() { return questions; }
    public void setQuestions(List<QuestionDto> questions) { this.questions = questions; }

    public static class QuestionDto {
        private String question;
        private List<String> options;
        private Integer correctIndex;
        private String explanation;

        public String getQuestion() { return question; }
        public void setQuestion(String question) { this.question = question; }
        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }
        public Integer getCorrectIndex() { return correctIndex; }
        public void setCorrectIndex(Integer correctIndex) { this.correctIndex = correctIndex; }
        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }
}
