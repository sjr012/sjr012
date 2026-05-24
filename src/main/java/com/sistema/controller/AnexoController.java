package com.sistema.controller;

import com.sistema.model.Anexo;
import com.sistema.model.OrdemServico;
import com.sistema.repository.AnexoRepository;
import com.sistema.repository.OrdemServicoRepository;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.List;

@RestController
@RequestMapping("/anexos")
@CrossOrigin(origins = "*")
public class AnexoController {

    private final AnexoRepository anexoRepository;
    private final OrdemServicoRepository ordemRepository;

    private final Path pastaUploads = Paths.get("uploads");

    public AnexoController(
            AnexoRepository anexoRepository,
            OrdemServicoRepository ordemRepository) {
        this.anexoRepository = anexoRepository;
        this.ordemRepository = ordemRepository;
    }

    @PostMapping("/upload/{ordemId}")
    public ResponseEntity<?> upload(
            @PathVariable @NonNull Long ordemId,
            @RequestParam("arquivo") MultipartFile arquivo) {
        try {
            Files.createDirectories(pastaUploads);

            OrdemServico ordem = ordemRepository.findById(ordemId)
                    .orElseThrow(() -> new RuntimeException("Ordem não encontrada"));

            String nomeArquivo = System.currentTimeMillis() + "_" + arquivo.getOriginalFilename();
            Path caminho = pastaUploads.resolve(nomeArquivo);

            Files.copy(arquivo.getInputStream(), caminho, StandardCopyOption.REPLACE_EXISTING);

            Anexo anexo = new Anexo();
            anexo.setNomeArquivo(arquivo.getOriginalFilename());
            anexo.setCaminhoArquivo(nomeArquivo);
            anexo.setTipoArquivo(arquivo.getContentType());
            anexo.setOrdemServico(ordem);

            anexoRepository.save(anexo);

            return ResponseEntity.ok(anexo);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao enviar anexo: " + e.getMessage());
        }
    }

    @GetMapping("/ordem/{ordemId}")
    public List<Anexo> listarPorOrdem(@PathVariable Long ordemId) {
        return anexoRepository.findByOrdemServicoId(ordemId);
    }

    @SuppressWarnings("null")
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        try {
            Anexo anexo = anexoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Anexo não encontrado"));

            Path caminho = pastaUploads.resolve(anexo.getCaminhoArquivo());
            Resource resource = new UrlResource(caminho.toUri());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(anexo.getTipoArquivo()))
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + anexo.getNomeArquivo() + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}