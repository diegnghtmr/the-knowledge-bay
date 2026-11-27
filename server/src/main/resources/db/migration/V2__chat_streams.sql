CREATE TABLE chat_stream_leases (
    lease_id UUID PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX chat_stream_leases_student ON chat_stream_leases(student_id, expires_at);
CREATE INDEX chat_stream_leases_expiry ON chat_stream_leases(expires_at);

-- Wake streams on any instance after a session revocation commits. No token material or actor data goes on the wire.
CREATE FUNCTION notify_student_session_deletions() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM deleted_sessions WHERE role = 'STUDENT') THEN
        PERFORM pg_notify('kb_session_' || md5(TG_TABLE_SCHEMA), '');
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER student_sessions_deleted
AFTER DELETE ON bearer_sessions REFERENCING OLD TABLE AS deleted_sessions
FOR EACH STATEMENT EXECUTE FUNCTION notify_student_session_deletions();
