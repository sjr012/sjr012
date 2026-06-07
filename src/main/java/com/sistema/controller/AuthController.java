package com.sistema.controller;

import org.springframework.security.crypto.password.PasswordEncoder;
import com.sistema.dto.LoginResponse;
import com.sistema.model.Usuario;
import com.sistema.repository.UsuarioRepository;
import com.sistema.security.JwtService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "https://sistema-frontend-orjl.onrender.com")
public class AuthController {

    private final UsuarioRepository repo;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UsuarioRepository repo,
            JwtService jwtService,
            PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario u) {

        Usuario usuario = repo.findByLogin(u.getLogin()).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(401).body("Login inválido!");
        }

        boolean senhaCorreta = false;

        // BCrypt
        if (usuario.getSenha().startsWith("$2")) {

            senhaCorreta = passwordEncoder.matches(
                    u.getSenha(),
                    usuario.getSenha());

        } else {

            // Senha antiga para texto puro
            senhaCorreta = u.getSenha().equals(usuario.getSenha());

            // Migra automaticamente para BCrypt
            if (senhaCorreta) {

                usuario.setSenha(
                        passwordEncoder.encode(u.getSenha()));

                repo.save(usuario);
            }
        }

        if (!senhaCorreta) {
            return ResponseEntity.status(401).body("Login inválido!");
        }

        String token = jwtService.gerarToken(usuario);

        return ResponseEntity.ok(
                new LoginResponse(token, usuario));
    }
}