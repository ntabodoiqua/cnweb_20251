package com.cnweb2025.user_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageSource messageSource;

    /**
     * Get localized message by key
     * @param key Message key from properties file
     * @return Localized message
     */
    public String getMessage(String key) {
        return getMessage(key, null);
    }

    /**
     * Get localized message by key with parameters
     * @param key Message key from properties file
     * @param args Arguments to replace placeholders in message
     * @return Localized message with replaced parameters
     */
    public String getMessage(String key, Object[] args) {
        Locale locale = LocaleContextHolder.getLocale();
        return messageSource.getMessage(key, args, key, locale);
    }

    /**
     * Get localized message by key with specific locale
     * @param key Message key from properties file
     * @param args Arguments to replace placeholders in message
     * @param locale Specific locale
     * @return Localized message with replaced parameters
     */
    public String getMessage(String key, Object[] args, Locale locale) {
        return messageSource.getMessage(key, args, key, locale);
    }
}
