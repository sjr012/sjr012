package com.sistema.controller;

import com.sistema.model.Usuario;
import com.sistema.repository.UsuarioRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioRepository repo;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository repo, PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<Usuario> listar() {
        return repo.findAll();
    }

    @PostMapping
    public Usuario salvar(@RequestBody Usuario usuario) {
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return repo.save(usuario);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable @NonNull Long id, @RequestBody Usuario dados) {

        Usuario usuario = repo.findById(id).orElse(null);

        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }

        usuario.setNome(dados.getNome());
        usuario.setLogin(dados.getLogin());
        usuario.setTipo(dados.getTipo());

        if (dados.getSenha() != null && !dados.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dados.getSenha()));
        }

        return ResponseEntity.ok(repo.save(usuario));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> excluir(@PathVariable @NonNull Long id) {

        if (!repo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        repo.deleteById(id);

        return ResponseEntity.ok().build();
    }

}