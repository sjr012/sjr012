package com.sistema.repository;

import com.sistema.model.Anexo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnexoRepository extends JpaRepository<Anexo, Long> {
    List<Anexo> findByOrdemServicoId(Long ordemId);
}