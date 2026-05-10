package com.sistema.controller;

import com.sistema.dto.LoginResponse;
import com.sistema.model.Usuario;
import com.sistema.repository.UsuarioRepository;
import com.sistema.security.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UsuarioRepository repo,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario u) {
        return repo.findByLogin(u.getLogin())
                .filter(usuario -> passwordEncoder.matches(u.getSenha(), usuario.getSenha()))
                .<ResponseEntity<?>>map(usuario -> {
                    String token = jwtService.gerarToken(usuario);
                    return ResponseEntity.ok(new LoginResponse(token, usuario));
                })
                .orElse(ResponseEntity.status(401).body("Login inválido"));
    }
}