package com.vdt2025.file_service.configuration;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.vdt2025.file_service.service.FileStorageProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class S3Config {

    private final FileStorageProperties fileStorageProperties;

    @Bean
    public AmazonS3 amazonS3() {
        FileStorageProperties.S3Properties s3Props = fileStorageProperties.getS3();
        
        if (s3Props == null) {
            throw new IllegalStateException("S3 properties are not configured");
        }

        BasicAWSCredentials credentials = new BasicAWSCredentials(
                s3Props.getAccessKey(),
                s3Props.getSecretKey()
        );

        AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                .withEndpointConfiguration(
                        new AwsClientBuilder.EndpointConfiguration(
                                s3Props.getEndpoint(),
                                s3Props.getRegion()
                        )
                )
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .withPathStyleAccessEnabled(false)
                .build();

        log.info("S3 client configured for endpoint: {} with bucket: {}", 
                s3Props.getEndpoint(), s3Props.getBucketName());

        return s3Client;
    }
}
