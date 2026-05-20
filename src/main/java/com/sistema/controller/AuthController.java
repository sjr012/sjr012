package com.sistema.controller;

import com.sistema.dto.LoginResponse;
import com.sistema.model.Usuario;
import com.sistema.repository.UsuarioRepository;
import com.sistema.security.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "/login")
public class AuthController {

    private final UsuarioRepository repo;
    private final JwtService jwtService;

    public AuthController(
            UsuarioRepository repo,
            JwtService jwtService) {
        this.repo = repo;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody Usuario u) {
        return repo.findByLogin(u.getLogin())
                .filter(usuario -> u.getSenha().equals(usuario.getSenha()))
                .<ResponseEntity<Object>>map(usuario -> {
                    String token = jwtService.gerarToken(usuario);
                    return ResponseEntity.ok(new LoginResponse(token, usuario));
                })
                .orElse(ResponseEntity.status(401).body("Login errado"));
    }
}