package com.ecoquest.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_questions")
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "quiz_question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_text", columnDefinition = "TEXT")
    @OrderColumn(name = "option_order")
    private List<String> options = new ArrayList<>();

    @Column(name = "correct_index")
    private Integer correctIndex;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "question_order")
    private Integer questionOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @JsonIgnore
    private Quiz quiz;

    public QuizQuestion() {}

    // Getters & Setters
    public Long getId() { return id; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }
    public Integer getCorrectIndex() { return correctIndex; }
    public void setCorrectIndex(Integer correctIndex) { this.correctIndex = correctIndex; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public Integer getQuestionOrder() { return questionOrder; }
    public void setQuestionOrder(Integer questionOrder) { this.questionOrder = questionOrder; }
    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final QuizQuestion q = new QuizQuestion();
        public Builder question(String v) { q.question = v; return this; }
        public Builder options(List<String> v) { q.options = v; return this; }
        public Builder correctIndex(Integer v) { q.correctIndex = v; return this; }
        public Builder explanation(String v) { q.explanation = v; return this; }
        public Builder questionOrder(Integer v) { q.questionOrder = v; return this; }
        public Builder quiz(Quiz v) { q.quiz = v; return this; }
        public QuizQuestion build() { return q; }
    }
}
