package com.nunescarneiroadvogados.quicksearch.adapter.repository

import com.nunescarneiroadvogados.quicksearch.domain.entity.Cliente
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ClienteRepository: JpaRepository<Cliente, String>