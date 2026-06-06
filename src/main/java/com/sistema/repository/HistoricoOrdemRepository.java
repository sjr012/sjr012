package com.sistema.repository;

import com.sistema.model.HistoricoOrdem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HistoricoOrdemRepository
                extends JpaRepository<HistoricoOrdem, Long> {
        List<HistoricoOrdem> findByOrdemIdOrderByDataHoraDesc(Long ordemId);

}