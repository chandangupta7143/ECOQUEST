package com.ecoquest.config;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JacksonConfig {

    /**
     * Configure Jackson to:
     * - Write dates as ISO strings (not timestamps)
     * - Ignore Hibernate lazy-loading proxy fields to prevent serialization errors
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Prevent Hibernate proxy serialization failures
        mapper.addMixIn(Object.class, HibernateProxyMixin.class);
        return mapper;
    }

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    abstract static class HibernateProxyMixin {}
}
