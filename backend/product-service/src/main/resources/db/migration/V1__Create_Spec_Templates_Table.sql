-- Migration script to create spec_templates table
-- This allows admins to define reusable spec templates for different product categories

CREATE TABLE IF NOT EXISTS spec_templates (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id VARCHAR(36) NOT NULL,
    spec_fields JSONB NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER DEFAULT 999,
    created_by VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_spec_template_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE,
    
    CONSTRAINT uk_spec_template_name_category
        UNIQUE (name, category_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_spec_templates_category_id ON spec_templates(category_id);
CREATE INDEX idx_spec_templates_is_active ON spec_templates(is_active);
CREATE INDEX idx_spec_templates_display_order ON spec_templates(display_order);

-- Add comment to table
COMMENT ON TABLE spec_templates IS 'Stores reusable specification templates for product categories';
COMMENT ON COLUMN spec_templates.spec_fields IS 'JSONB column storing specification field definitions with i18n labels';
