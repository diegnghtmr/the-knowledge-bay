-- Estudiantes
CREATE TABLE IF NOT EXISTS students (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        username TEXT NOT NULL UNIQUE,
                                        email TEXT NOT NULL UNIQUE,
                                        password TEXT NOT NULL,
                                        first_name TEXT NOT NULL,
                                        last_name TEXT NOT NULL,
                                        date_birth DATE,
                                        biography TEXT
);

CREATE TABLE IF NOT EXISTS students_interests (
                                                student_id INTEGER,
                                                interest_id INTEGER,
                                                PRIMARY KEY (student_id, interest_id),
                                                FOREIGN KEY (student_id) REFERENCES students(id),
                                                FOREIGN KEY (interest_id) REFERENCES interests(id_interest)
);

-- Intereses
CREATE TABLE IF NOT EXISTS interests (
                                         id_interest INTEGER PRIMARY KEY AUTOINCREMENT,
                                         name TEXT NOT NULL UNIQUE
);

-- Comentarios
CREATE TABLE IF NOT EXISTS comments (
                                        comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        text TEXT NOT NULL,
                                        author_id INTEGER NOT NULL,
                                        date DATE NOT NULL,
                                        FOREIGN KEY (author_id) REFERENCES students(id)
);

-- Contenidos
CREATE TABLE IF NOT EXISTS contents (
                                        content_id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        title TEXT NOT NULL,
                                        information TEXT NOT NULL,
                                        author_id INTEGER NOT NULL,
                                        like_count INTEGER DEFAULT 0,
                                        date DATE NOT NULL,
                                        FOREIGN KEY (author_id) REFERENCES students(id)
);

-- Temas de un contenido (muchos-a-muchos)
CREATE TABLE IF NOT EXISTS content_topics (
                                              content_id INTEGER,
                                              interest_id INTEGER,
                                              PRIMARY KEY (content_id, interest_id),
                                              FOREIGN KEY (content_id) REFERENCES contents(content_id),
                                              FOREIGN KEY (interest_id) REFERENCES interests(id_interest)
);

-- Likes de estudiantes a contenidos
CREATE TABLE IF NOT EXISTS content_likes (
                                             content_id INTEGER,
                                             student_id INTEGER,
                                             PRIMARY KEY (content_id, student_id),
                                             FOREIGN KEY (content_id) REFERENCES contents(content_id),
                                             FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Comentarios en contenido
CREATE TABLE IF NOT EXISTS content_comments (
                                                content_id INTEGER,
                                                comment_id INTEGER,
                                                PRIMARY KEY (content_id, comment_id),
                                                FOREIGN KEY (content_id) REFERENCES contents(content_id),
                                                FOREIGN KEY (comment_id) REFERENCES comments(comment_id)
);

-- Pedidos de ayuda
CREATE TABLE IF NOT EXISTS help_requests (
                                             request_id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             information TEXT NOT NULL,
                                             urgency TEXT NOT NULL,
                                             student_id INTEGER NOT NULL,
                                             is_completed INTEGER NOT NULL,
                                             request_date DATE NOT NULL,
                                             FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Temas de los pedidos
CREATE TABLE IF NOT EXISTS help_request_topics (
                                                   request_id INTEGER,
                                                   interest_id INTEGER,
                                                   PRIMARY KEY (request_id, interest_id),
                                                   FOREIGN KEY (request_id) REFERENCES help_requests(request_id),
                                                   FOREIGN KEY (interest_id) REFERENCES interests(id_interest)
);

-- Comentarios en pedidos
CREATE TABLE IF NOT EXISTS help_request_comments (
                                                     request_id INTEGER,
                                                     comment_id INTEGER,
                                                     PRIMARY KEY (request_id, comment_id),
                                                     FOREIGN KEY (request_id) REFERENCES help_requests(request_id),
                                                     FOREIGN KEY (comment_id) REFERENCES comments(comment_id)
);

-- Grupos de estudio
CREATE TABLE IF NOT EXISTS study_groups (
                                            group_id INTEGER PRIMARY KEY AUTOINCREMENT,
                                            name TEXT NOT NULL,
                                            topic_id INTEGER,
                                            date DATE NOT NULL,
                                            hidden INTEGER NOT NULL,
                                            FOREIGN KEY (topic_id) REFERENCES interests(id_interest)
);

-- Miembros del grupo
CREATE TABLE IF NOT EXISTS study_group_members (
                                                   group_id INTEGER,
                                                   student_id INTEGER,
                                                   PRIMARY KEY (group_id, student_id),
                                                   FOREIGN KEY (group_id) REFERENCES study_groups(group_id),
                                                   FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Contenidos asociados al grupo
CREATE TABLE IF NOT EXISTS study_group_contents (
                                                    group_id INTEGER,
                                                    content_id INTEGER,
                                                    PRIMARY KEY (group_id, content_id),
                                                    FOREIGN KEY (group_id) REFERENCES study_groups(group_id),
                                                    FOREIGN KEY (content_id) REFERENCES contents(content_id)
);

-- Ayudas asociadas al grupo
CREATE TABLE IF NOT EXISTS study_group_help_requests (
                                                         group_id INTEGER,
                                                         request_id INTEGER,
                                                         PRIMARY KEY (group_id, request_id),
                                                         FOREIGN KEY (group_id) REFERENCES study_groups(group_id),
                                                         FOREIGN KEY (request_id) REFERENCES help_requests(request_id)
);

-- Chats entre estudiantes
CREATE TABLE IF NOT EXISTS chats (
                                     chat_id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     student_a_id INTEGER NOT NULL,
                                     student_b_id INTEGER NOT NULL,
                                     FOREIGN KEY (student_a_id) REFERENCES students(id),
                                     FOREIGN KEY (student_b_id) REFERENCES students(id)
);

-- Mensajes
CREATE TABLE IF NOT EXISTS messages (
                                        message_id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        text TEXT NOT NULL,
                                        sender_id INTEGER NOT NULL,
                                        timestamp DATETIME NOT NULL,
                                        chat_id INTEGER NOT NULL,
                                        FOREIGN KEY (sender_id) REFERENCES students(id),
                                        FOREIGN KEY (chat_id) REFERENCES chats(chat_id)
);
