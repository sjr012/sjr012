package com.sistema.controller;

import com.sistema.model.Funcionario;
import com.sistema.repository.FuncionarioRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/funcionarios")
@CrossOrigin(origins = "*")
public class FuncionarioController {

    private final FuncionarioRepository repo;

    public FuncionarioController(FuncionarioRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Funcionario> listar() {
        return repo.findAll();
    }

    @PostMapping
    public Funcionario salvar(@RequestBody @NonNull Funcionario funcionario) {
        return repo.save(funcionario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(
            @PathVariable("id") @NonNull Long id,
            @RequestBody Funcionario dados
    ) {
        Funcionario funcionario = repo.findById(id).orElse(null);

        if (funcionario == null) {
            return ResponseEntity.notFound().build();
        }

        funcionario.setNome(dados.getNome());
        funcionario.setCargo(dados.getCargo());

        return ResponseEntity.ok(repo.save(funcionario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(
            @PathVariable("id") @NonNull Long id
    ) {
        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repo.deleteById(id);

        return ResponseEntity.ok().build();
    }
}