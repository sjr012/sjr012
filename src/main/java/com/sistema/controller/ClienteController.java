package com.sistema.controller;

import com.sistema.model.Cliente;
import com.sistema.repository.ClienteRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clientes")
@CrossOrigin(origins = "*")
public class ClienteController {

    private final ClienteRepository repo;

    public ClienteController(ClienteRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Cliente> listar() {
        return repo.findAll();
    }

    @PostMapping
    public Cliente salvar(@RequestBody @NonNull Cliente cliente) {
        return repo.save(cliente);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
            @PathVariable("id") @NonNull Long id,
            @RequestBody Cliente dados) {
        Cliente cliente = repo.findById(id).orElse(null);

        if (cliente == null) {
            return ResponseEntity.notFound().build();
        }

        cliente.setNome(dados.getNome());
        cliente.setTelefone(dados.getTelefone());
        cliente.setEmail(dados.getEmail());

        return ResponseEntity.ok(repo.save(cliente));
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