package co.edu.uniquindio.theknowledgebay.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

public final class ApiFailure {
    public static final String REQUEST_ID = "requestId";
    private static final Logger LOG = LoggerFactory.getLogger(ApiFailure.class);

    private ApiFailure() {}

    public static void report(String operation) {
        LOG.error("API operation failed: operation={}, requestId={}", operation, MDC.get(REQUEST_ID));
    }
}
