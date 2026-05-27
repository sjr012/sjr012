package com.sistema.controller;

import com.sistema.model.Cliente;
import com.sistema.model.Funcionario;
import com.sistema.model.OrdemServico;
import com.sistema.repository.ClienteRepository;
import com.sistema.repository.FuncionarioRepository;
import com.sistema.repository.OrdemServicoRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/ordens")
@CrossOrigin(origins = "*")
public class OrdemServicoController {

    private final OrdemServicoRepository repo;
    private final ClienteRepository clienteRepository;
    private final FuncionarioRepository funcionarioRepository;

    public OrdemServicoController(
            OrdemServicoRepository repo,
            ClienteRepository clienteRepository,
            FuncionarioRepository funcionarioRepository) {
        this.repo = repo;
        this.clienteRepository = clienteRepository;
        this.funcionarioRepository = funcionarioRepository;
    }

    @GetMapping
    public Page<OrdemServico> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);

        return repo.findAll(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(
            @PathVariable("id") Long id) {

        OrdemServico ordem = repo.findById(id).orElse(null);

        if (ordem == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(ordem);
    }

    @PostMapping
    public OrdemServico abrir(@RequestBody OrdemServico ordem) {
        ordem.setStatus("ABERTA");
        ordem.setDataAbertura(LocalDateTime.now());
        return repo.save(ordem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
            @PathVariable("id") @NonNull Long id,
            @RequestBody OrdemServico dados) {

        OrdemServico ordem = repo.findById(id).orElse(null);

        if (ordem == null) {
            return ResponseEntity.notFound().build();
        }

        ordem.setDescricao(dados.getDescricao());

        if (dados.getStatus() != null && !dados.getStatus().isBlank()) {
            ordem.setStatus(dados.getStatus());
        }

        if (dados.getCliente() != null && dados.getCliente().getId() != null) {

            Cliente cliente = clienteRepository
                    .findById(dados.getCliente().getId())
                    .orElse(null);

            ordem.setCliente(cliente);
        }

        if (dados.getFuncionario() != null &&
                dados.getFuncionario().getId() != null) {

            Funcionario funcionario = funcionarioRepository
                    .findById(dados.getFuncionario().getId())
                    .orElse(null);

            ordem.setFuncionario(funcionario);
        }

        return ResponseEntity.ok(repo.save(ordem));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> atualizarStatus(
            @PathVariable("id") @NonNull Long id,
            @RequestBody OrdemServico dados) {

        OrdemServico ordem = repo.findById(id).orElse(null);

        if (ordem == null) {
            return ResponseEntity.notFound().build();
        }

        if (dados.getStatus() == null || dados.getStatus().isBlank()) {
            return ResponseEntity.badRequest().body("Status inválido");
        }

        ordem.setStatus(dados.getStatus());

        // SE FINALIZAR
        if (dados.getStatus().equals("FINALIZADA") ||
                dados.getStatus().equals("ENTREGUE")) {

            if (ordem.getDataFechamento() == null) {
                ordem.setDataFechamento(LocalDateTime.now());
            }

        } else {

            ordem.setDataFechamento(null);
        }

        return ResponseEntity.ok(repo.save(ordem));
    }

    @PutMapping("/{id}/fechar")
    public OrdemServico fechar(@PathVariable("id") @NonNull Long id) {
        OrdemServico ordem = repo.findById(id).orElseThrow();

        ordem.setStatus("FECHADA");
        ordem.setDataFechamento(LocalDateTime.now());

        return repo.save(ordem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable("id") @NonNull Long id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repo.deleteById(id);

        return ResponseEntity.ok().build();
    }
}