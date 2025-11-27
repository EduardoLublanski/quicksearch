package com.nunescarneiroadvogados.quicksearch.adapter.repository

import com.nunescarneiroadvogados.quicksearch.domain.entity.Advogado
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AdvogadoRepository: JpaRepository<Advogado, String> {
}