package com.cnweb2025.user_service.validator;

import jakarta.validation.ConstraintValidator;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Objects;

public class DobValidator implements ConstraintValidator<DobConstrain, LocalDate> {
    private int min;

    @Override
    public boolean isValid(LocalDate dob, jakarta.validation.ConstraintValidatorContext context) {
        if (Objects.isNull(dob)) {
            return true;
        }
        // Kiểm tra xem người được tạo có đủ $min tuổi hay không
        LocalDate today = LocalDate.now();
        long age = ChronoUnit.YEARS.between(dob, today);
        return age >= min;
    }

    @Override
    public void initialize(DobConstrain constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
        min = constraintAnnotation.min();
    }
}
