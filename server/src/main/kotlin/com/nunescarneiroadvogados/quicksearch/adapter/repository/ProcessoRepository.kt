package com.nunescarneiroadvogados.quicksearch.adapter.repository

import com.nunescarneiroadvogados.quicksearch.domain.entity.processo.Processo
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface ProcessoRepository: JpaRepository<Processo, Long> {
    // Método para encontrar ou retornar null

    // Método nativo para delete (opcional)
    @Modifying
    @Query("DELETE FROM processos WHERE id = :id", nativeQuery = true)
    fun deleteByIdNative(@Param("id") id: Long)
}