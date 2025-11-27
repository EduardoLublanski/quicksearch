package com.nunescarneiroadvogados.quicksearch.adapter.repository

import com.nunescarneiroadvogados.quicksearch.domain.entity.processo.Prazo
import org.springframework.data.jpa.repository.JpaRepository

interface PrazoRepository: JpaRepository<Prazo, Long> {
}