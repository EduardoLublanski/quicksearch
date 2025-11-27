package com.nunescarneiroadvogados.quicksearch.adapter.repository

import com.nunescarneiroadvogados.quicksearch.domain.entity.processo.Documento
import org.springframework.data.jpa.repository.JpaRepository

interface DocumentoRepository: JpaRepository<Documento, Long>