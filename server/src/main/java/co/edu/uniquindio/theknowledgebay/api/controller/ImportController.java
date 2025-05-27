package co.edu.uniquindio.theknowledgebay.api.controller;

import co.edu.uniquindio.theknowledgebay.api.dto.ImportDTO;
import co.edu.uniquindio.theknowledgebay.core.service.ImportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/import")
public class ImportController {

    private final ImportService importService;

    public ImportController(ImportService importService) {
        this.importService = importService;
    }


    @PostMapping()
    public ResponseEntity<String> importData(@RequestBody ImportDTO data) {
        try {
            String result = importService.processImport(data);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace(); // <-- imprime el error real en consola
            return ResponseEntity.internalServerError().body("Error interno del servidor");
        }
    }}
