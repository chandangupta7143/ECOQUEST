package com.ecoquest.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.user:}")
    private String emailUser;

    @Value("${app.email.pass:}")
    private String emailPass;

    @Value("${app.email.from:EcoQuest <noreply@ecoquest.app>}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public boolean isEmailConfigured() {
        return emailUser != null && !emailUser.isBlank()
                && emailPass != null && !emailPass.isBlank();
    }

    public void sendVerificationEmail(String to, String token) {
        String verifyUrl = "http://localhost:5000/api/auth/verify-email?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject("EcoQuest — Verify your email");
        message.setText(
            "Welcome to EcoQuest!\n\n"
          + "Please verify your email by clicking the link below:\n"
          + verifyUrl + "\n\n"
          + "This link expires in 24 hours.\n\n"
          + "If you did not register, please ignore this email."
        );
        mailSender.send(message);
    }
}
