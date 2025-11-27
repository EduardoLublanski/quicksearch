package com.nunescarneiroadvogados.quicksearch.domain.dto

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalDateTime

data class PrazoDto(
    val id: Long = 0,

    val assunto: String = "",

    @field:JsonProperty("data_hora")
    val dataHora: LocalDateTime = LocalDateTime.now()
)
