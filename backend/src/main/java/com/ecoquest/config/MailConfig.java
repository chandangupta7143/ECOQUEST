package com.ecoquest.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    @Value("${app.email.user:}")
    private String emailUser;

    @Value("${app.email.pass:}")
    private String emailPass;

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        if (emailUser != null && !emailUser.isBlank()) {
            mailSender.setHost("smtp.gmail.com");
            mailSender.setPort(587);
            mailSender.setUsername(emailUser);
            mailSender.setPassword(emailPass);

            Properties props = mailSender.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.debug", "false");
        }

        return mailSender;
    }
}
