package co.edu.uniquindio.theknowledgebay.core.service;

import co.edu.uniquindio.theknowledgebay.core.model.Attachment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;
import java.util.UUID;

import static java.nio.charset.StandardCharsets.US_ASCII;
import static java.nio.file.LinkOption.NOFOLLOW_LINKS;

@Service
@Slf4j
public class AttachmentStorage {
    public static final String DEFAULT_DIRECTORY = "./data/uploads";
    public static final int MAX_SIZE = 5 * 1024 * 1024;
    public static final String SIZE_ERROR = "El archivo supera el límite de 5 MiB.";
    private static final String TYPE_ERROR = "Solo se permiten archivos PDF, PNG o JPEG.";
    private static final String NAME_ERROR = "El nombre del archivo no es válido.";
    private static final HexFormat HEX = HexFormat.of();
    private static final String DEFAULT_STATIC_LOCATIONS = "classpath:/META-INF/resources/,classpath:/resources/,classpath:/static/,classpath:/public/";
    private final Path configuredRoot;
    private final List<Path> staticRoots;

    public AttachmentStorage(@Value("${app.uploads.dir:" + DEFAULT_DIRECTORY + "}") String directory, Environment environment) {
        if (directory.isBlank()) throw new InvalidPathException(directory, "The attachments directory is blank");
        configuredRoot = Path.of(directory).toAbsolutePath().normalize();
        var locations = environment.getProperty("spring.web.resources.static-locations", DEFAULT_STATIC_LOCATIONS);
        staticRoots = Arrays.stream(locations.split(",")).map(String::strip).flatMap(AttachmentStorage::fileRoot).toList();
    }

    private static Stream<Path> fileRoot(String location) {
        if (!location.startsWith("file:") && !location.startsWith("classpath:")) return Stream.empty();
        var resource = new DefaultResourceLoader().getResource(location);
        try {
            // Spring's file resources also resolve relative locations such as file:./web/.
            return resource.isFile() ? Stream.of(resource.getFile().toPath().toAbsolutePath().normalize()) : Stream.empty();
        } catch (IOException ignored) {
            // A missing or packaged classpath resource has no filesystem directory to protect.
            return Stream.empty();
        }
    }

    public Attachment store(MultipartFile file) throws IOException {
        if (file.getSize() > MAX_SIZE) throw new Rejected(HttpStatus.PAYLOAD_TOO_LARGE, SIZE_ERROR);
        String filename = file.getOriginalFilename();
        if (filename == null || filename.length() > 150 || filename.isBlank() || filename.startsWith(".")
                || filename.codePoints().anyMatch(c -> Character.isISOControl(c) || Character.getType(c) == Character.FORMAT
                    || c == '/' || c == '\\' || c == ':' || c == '"')) {
            throw new Rejected(HttpStatus.BAD_REQUEST, NAME_ERROR);
        }
        byte[] bytes;
        try (var input = file.getInputStream()) {
            // Read only up to the limit even if this multipart implementation reports an incorrect size.
            bytes = input.readNBytes(MAX_SIZE + 1);
        }
        if (bytes.length > MAX_SIZE) throw new Rejected(HttpStatus.PAYLOAD_TOO_LARGE, SIZE_ERROR);
        String type = detect(bytes, filename.toLowerCase(Locale.ROOT));
        var path = root().resolve(UUID.randomUUID() + ".bin");
        var created = Files.newOutputStream(path, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);
        try (created) {
            created.write(bytes);
        } catch (IOException e) {
            try { Files.deleteIfExists(path); } catch (IOException cleanup) { e.addSuppressed(cleanup); }
            throw e;
        }
        return new Attachment(path.getFileName().toString(), filename, type, bytes.length);
    }

    public Resource open(Attachment attachment) throws IOException {
        Path path = resolve(attachment);
        if (!Files.isRegularFile(path, NOFOLLOW_LINKS) || Files.size(path) != attachment.size()) return null;
        return new FileSystemResource(path);
    }

    public void discard(Attachment attachment) {
        if (attachment == null) return;
        try {
            Files.deleteIfExists(resolve(attachment));
        } catch (IOException e) {
            log.warn("Could not clean up an attachment from private storage");
        }
    }

    private Path resolve(Attachment attachment) throws IOException {
        String key = attachment.storageKey();
        if (!key.matches("[a-f0-9-]{36}\\.bin")) throw new IOException("Invalid storage key");
        return root().resolve(key);
    }

    public void verifyWritableDirectory() throws IOException {
        var probe = root(false).resolve(".kb-upload-probe-" + UUID.randomUUID());
        try (var channel = Files.newByteChannel(probe, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE,
                StandardOpenOption.DELETE_ON_CLOSE)) {
            // Opening a file tests the mounted filesystem with this process's effective permissions.
        }
    }

    private Path root() throws IOException {
        return root(true);
    }

    private Path root(boolean create) throws IOException {
        checkOutsideStatic(configuredRoot);
        var actual = (create ? Files.createDirectories(configuredRoot) : configuredRoot).toRealPath();
        checkOutsideStatic(actual);
        return actual;
    }

    private void checkOutsideStatic(Path directory) throws IOException {
        for (Path root : staticRoots) {
            if (directory.startsWith(root) || (Files.exists(root) && directory.startsWith(root.toRealPath()))) {
                throw new IOException("Uploads must be outside static resource directories");
            }
        }
    }

    private static String detect(byte[] bytes, String name) {
        if (name.endsWith(".pdf") && bytes.length >= 16 && new String(bytes, 0, 8, US_ASCII).matches("%PDF-[12]\\.[0-9]")
                && (bytes[8] == '\n' || bytes[8] == '\r')
                && new String(bytes, Math.max(0, bytes.length - 32), Math.min(32, bytes.length), US_ASCII)
                        .stripTrailing().endsWith("%%EOF")) return "application/pdf";
        if (name.endsWith(".png") && bytes.length >= 45 && at(bytes, 0, "89504e470d0a1a0a0000000d49484452")
                && at(bytes, bytes.length - 12, "0000000049454e44ae426082")) return "image/png";
        if ((name.endsWith(".jpg") || name.endsWith(".jpeg")) && bytes.length >= 16
                && at(bytes, 0, "ffd8ff") && at(bytes, bytes.length - 2, "ffd9")) return "image/jpeg";
        throw new Rejected(HttpStatus.UNSUPPORTED_MEDIA_TYPE, TYPE_ERROR);
    }

    private static boolean at(byte[] bytes, int offset, String signature) {
        var expected = HEX.parseHex(signature);
        for (int i = 0; i < expected.length; i++) if (bytes[offset + i] != expected[i]) return false;
        return true;
    }

    public static final class Rejected extends RuntimeException {
        private final HttpStatus status;
        Rejected(HttpStatus status, String message) { super(message); this.status = status; }
        public HttpStatus status() { return status; }
    }
}
