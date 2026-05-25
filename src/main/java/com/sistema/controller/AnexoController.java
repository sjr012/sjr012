package com.sistema.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import com.sistema.model.Anexo;
import com.sistema.model.OrdemServico;
import com.sistema.repository.AnexoRepository;
import com.sistema.repository.OrdemServicoRepository;

import org.springframework.http.*;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/anexos")
@CrossOrigin(origins = "*")
public class AnexoController {

    private final AnexoRepository anexoRepository;
    private final OrdemServicoRepository ordemRepository;
    private final Cloudinary cloudinary;

    public AnexoController(
            AnexoRepository anexoRepository,
            OrdemServicoRepository ordemRepository,
            Cloudinary cloudinary) {

        this.anexoRepository = anexoRepository;
        this.ordemRepository = ordemRepository;
        this.cloudinary = cloudinary;
    }

    @PostMapping("/upload/{ordemId}")
    public ResponseEntity<?> upload(
            @PathVariable @NonNull Long ordemId,
            @RequestParam("arquivo") MultipartFile arquivo) {

        try {

            OrdemServico ordem = ordemRepository.findById(ordemId)
                    .orElseThrow(() -> new RuntimeException("Ordem não encontrada"));

            Map uploadResult = cloudinary.uploader().upload(
                    arquivo.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "systec/anexos",
                            "resource_type", "auto"));

            String urlArquivo = uploadResult.get("secure_url").toString();

            Anexo anexo = new Anexo();

            anexo.setNomeArquivo(arquivo.getOriginalFilename());

            anexo.setCaminhoArquivo(urlArquivo);

            anexo.setTipoArquivo(arquivo.getContentType());

            anexo.setOrdemServico(ordem);

            anexoRepository.save(anexo);

            return ResponseEntity.ok(anexo);

        } catch (Exception e) {

            return ResponseEntity
                    .status(500)
                    .body("Erro ao enviar anexo: " + e.getMessage());
        }
    }

    @GetMapping("/ordem/{ordemId}")
    public List<Anexo> listarPorOrdem(@PathVariable Long ordemId) {

        return anexoRepository.findByOrdemServicoId(ordemId);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<?> download(@PathVariable Long id) {

        try {

            Anexo anexo = anexoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Anexo não encontrado"));

            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(anexo.getCaminhoArquivo()))
                    .build();

        } catch (Exception e) {

            return ResponseEntity.notFound().build();
        }
    }
}