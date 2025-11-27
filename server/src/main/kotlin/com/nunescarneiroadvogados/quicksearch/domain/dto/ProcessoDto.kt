package com.nunescarneiroadvogados.quicksearch.domain.dto

import com.fasterxml.jackson.databind.PropertyNamingStrategies
import com.fasterxml.jackson.databind.annotation.JsonNaming
import com.nunescarneiroadvogados.quicksearch.domain.entity.processo.Documento
import com.nunescarneiroadvogados.quicksearch.domain.entity.processo.Prazo
import java.time.LocalDate


@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy::class)
data class ProcessoDto(
    val id: Long? = null,
    val numero: String = "",
    val dataAbertura: LocalDate? = null,
    val dataEncerramento: LocalDate? = null,
    val status: String = "",
    val descricao: String = "",
    val tipo: String = "",
    val vara: String = "",
    val valorCausa: Double = 0.0,
    val codigoOab: String = "",
    val clienteCpf: String = "",
    val localizacao: String = "",
    val documentosPendentes: List<Documento> = emptyList(),
    val prazosProcessuais: List<Prazo> = emptyList()
)

